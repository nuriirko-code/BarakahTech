const Payment = require('../models/Payment')
const Enrollment = require('../models/Enrollment')
const Course = require('../models/Course')
const EarningsLedger = require('../models/EarningsLedger')
const { calculateFees, generatePaymentCode } = require('../utils/paymentUtils')

// Auth tokens in this app store the account identifier as userId. Accept id as a fallback
// too so the payment endpoints remain compatible with either verified token shape.
const getCurrentUserId = (req) => req.user?.id || req.user?.userId

// Manual verification replaces automated Stripe charging during the local-payment phase.
// This lets the team verify the student-to-bank transfer flow before Chapa in V2 and
// international Stripe payments in V3.
const initiateCoursePayment = async (req, res) => {
  try {
    const { courseId } = req.params
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    if (course.status !== 'published') {
      return res.status(400).json({ message: 'This course is not available for payment' })
    }

    if (course.isFree) {
      return res.status(400).json({ message: 'This course is free. Use free enrollment instead.' })
    }

    if (!Number.isFinite(Number(course.price)) || Number(course.price) <= 0) {
      return res.status(400).json({ message: 'This course does not have a valid paid price' })
    }

    const studentId = getCurrentUserId(req)
    const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId })

    if (existingEnrollment) {
      return res.status(400).json({ message: 'You are already enrolled in this course' })
    }

    const paymentMethod = ['telebirr', 'cbe_birr', 'other_mobile'].includes(req.body.method)
      ? req.body.method
      : 'manual'
    const pendingPayment = await Payment.findOne({
      payer: studentId,
      course: courseId,
      status: 'pending',
    })

    if (pendingPayment) {
      if (pendingPayment.manualPaymentReference) {
        return res.status(400).json({
          message: 'You already submitted payment proof for this course. Please wait for admin verification.',
        })
      }

      // A student may leave before sending money. Reuse their existing order and code
      // so they can resume checkout without creating duplicate pending payment records.
      pendingPayment.paymentMethod = paymentMethod
      await pendingPayment.save()

      return res.status(200).json({
        message: 'Resuming your pending payment instructions',
        payment: pendingPayment,
        platformPaymentCode: pendingPayment.platformPaymentCode,
      })
    }

    const currency = String(course.currency || 'ETB').toUpperCase()
    const commissionPercentage = Number(process.env.PLATFORM_COMMISSION_PERCENTAGE || 20)
    const fees = calculateFees(course.price, currency, commissionPercentage)
    const platformPaymentCode = generatePaymentCode()

    // We create the record before money arrives so there is a known order and a code
    // the student can include in their bank or mobile-money transfer reference.
    const payment = await Payment.create({
      payer: studentId,
      recipient: course.teacher,
      type: 'course_purchase',
      status: 'pending',
      amount: course.price,
      currency,
      platformFeePercentage: commissionPercentage,
      platformFeeAmount: fees.platformFeeAmount,
      teacherEarningAmount: fees.teacherEarningAmount,
      course: courseId,
      gateway: 'manual',
      paymentMethod,
      platformPaymentCode,
    })

    return res.status(201).json({
      message: 'Payment instructions created successfully',
      payment,
      platformPaymentCode,
    })
  } catch (error) {
    console.error('Initiate course payment error:', error)
    return res.status(500).json({ message: 'Server error while creating payment instructions' })
  }
}

const confirmStudentPayment = async (req, res) => {
  try {
    const { paymentId } = req.params
    const { manualPaymentReference, studentNote } = req.body

    if (!manualPaymentReference?.trim()) {
      return res.status(400).json({ message: 'Your transaction ID is required' })
    }

    const payment = await Payment.findById(paymentId)

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    if (payment.payer.toString() !== getCurrentUserId(req)?.toString()) {
      return res.status(403).json({ message: 'You can only submit proof for your own payment' })
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'This payment has already been processed' })
    }

    payment.manualPaymentReference = manualPaymentReference.trim()
    payment.studentNote = String(studentNote || '').trim()
    await payment.save()

    // Student proof is only a claim, not proof that funds reached the platform account.
    // Enrollment stays locked until an administrator checks the transfer and approves it.
    return res.status(200).json({
      message: 'Payment confirmation submitted. Your enrollment will be activated after admin verification. This usually takes a few hours.',
      payment,
    })
  } catch (error) {
    console.error('Confirm student payment error:', error)
    return res.status(500).json({ message: 'Server error while submitting payment confirmation' })
  }
}

const adminVerifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params
    const { action, adminNote } = req.body
    const payment = await Payment.findById(paymentId)

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Action must be approve or reject' })
    }

    if (payment.status !== 'pending' || !payment.manualPaymentReference) {
      return res.status(400).json({ message: 'Only submitted pending payments can be verified' })
    }

    // Admin review is the trust boundary: a student can submit a transaction ID, but only
    // staff comparing it with actual account activity can grant course access.
    payment.verifiedBy = getCurrentUserId(req)
    payment.verifiedAt = new Date()
    payment.adminNote = String(adminNote || '').trim()

    if (action === 'reject') {
      payment.status = 'failed'
      await payment.save()

      return res.status(200).json({
        message: 'Payment rejected. Student will need to resubmit.',
        payment,
      })
    }

    const course = await Course.findById(payment.course)

    if (!course) {
      return res.status(404).json({ message: 'Course not found for this payment' })
    }

    const existingEnrollment = await Enrollment.findOne({ student: payment.payer, course: payment.course })

    if (existingEnrollment) {
      return res.status(409).json({ message: 'The student is already enrolled in this course' })
    }

    const enrollment = await Enrollment.create({
      student: payment.payer,
      course: payment.course,
      teacher: course.teacher,
      amountPaid: payment.amount,
      currency: payment.currency,
      paymentStatus: 'paid',
      paymentReference: payment.manualPaymentReference,
    })

    course.totalEnrollments = Number(course.totalEnrollments || 0) + 1
    await course.save()

    await EarningsLedger.create({
      teacher: course.teacher,
      student: payment.payer,
      payment: payment._id,
      course: payment.course,
      date: new Date(),
      grossAmount: payment.amount,
      platformFeeAmount: payment.platformFeeAmount,
      netAmount: payment.teacherEarningAmount,
      currency: payment.currency,
      status: 'pending',
      approvedByFeedback: false,
    })

    payment.status = 'completed'
    payment.enrollment = enrollment._id
    await payment.save()

    return res.status(200).json({
      message: 'Payment verified. Student enrollment activated.',
      enrollment,
    })
  } catch (error) {
    console.error('Admin verify payment error:', error)
    return res.status(500).json({ message: 'Server error while verifying payment' })
  }
}

const getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      status: 'pending',
      manualPaymentReference: { $exists: true, $ne: '' },
    })
      .populate('payer', 'name email')
      .populate('course', 'title price currency')
      .sort({ createdAt: 1 })

    return res.status(200).json({ payments, count: payments.length })
  } catch (error) {
    console.error('Get pending payments error:', error)
    return res.status(500).json({ message: 'Server error while loading pending payments' })
  }
}

const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ payer: getCurrentUserId(req) })
      .populate('course', 'title')
      .sort({ createdAt: -1 })

    return res.status(200).json({ payments })
  } catch (error) {
    console.error('Get my payments error:', error)
    return res.status(500).json({ message: 'Server error while loading payments' })
  }
}

const getTeacherEarnings = async (req, res) => {
  try {
    const entries = await EarningsLedger.find({ teacher: getCurrentUserId(req) }).sort({ date: -1 })

    // The three states are important because they represent different business moments:
    // pending means the money is not yet approved, approved means the day's value has been accepted,
    // and paid_out shows the teacher has actually received the money.
    const totals = {
      totalPending: entries
        .filter((entry) => entry.status === 'pending')
        .reduce((total, entry) => total + Number(entry.netAmount || 0), 0),
      totalApproved: entries
        .filter((entry) => entry.status === 'approved')
        .reduce((total, entry) => total + Number(entry.netAmount || 0), 0),
      totalPaidOut: entries
        .filter((entry) => entry.status === 'paid_out')
        .reduce((total, entry) => total + Number(entry.netAmount || 0), 0),
    }

    return res.status(200).json({ entries, totals })
  } catch (error) {
    console.error('Get teacher earnings error:', error)
    return res.status(500).json({ message: 'Server error while loading earnings' })
  }
}

module.exports = {
  initiateCoursePayment,
  confirmStudentPayment,
  adminVerifyPayment,
  getPendingPayments,
  getMyPayments,
  getTeacherEarnings,
}
