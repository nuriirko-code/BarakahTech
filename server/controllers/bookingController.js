const SessionBooking = require('../models/SessionBooking')
const LiveTutorProfile = require('../models/LiveTutorProfile')
const TutorAvailability = require('../models/TutorAvailability')
const Payment = require('../models/Payment')
const User = require('../models/User')
const { calculateFees, generatePaymentCode } = require('../utils/paymentUtils')
const { sendLiveSessionConfirmedEmails } = require('../utils/emailService')

const FREE_TRIAL_DURATION = 30
const validLevels = ['beginner', 'intermediate', 'advanced']
const validPaymentMethods = ['telebirr', 'cbe_birr', 'other_mobile', 'manual']

const getCurrentUserId = (req) => req.user?.userId || req.user?.id

// Converts wall-clock values into minutes so availability and conflict checks
// compare numbers instead of unreliable time strings.
const toMinutes = (time) => {
  const [hours, minutes] = String(time || '').split(':').map(Number)
  return Number.isInteger(hours) && Number.isInteger(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60
    ? (hours * 60) + minutes
    : null
}

const toTime = (minutes) => `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
const bookingDayName = (date) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getUTCDay()]

const dateBounds = (date) => {
  const start = new Date(date)
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)
  return { start, end }
}

// New profiles have a direct offer; the fallback keeps tutors created before
// this policy visible while their price is updated through a future editor.
const getPaidOffer = (profile) => {
  const duration = Number(profile.sessionDuration || profile.sessionDurations?.[0] || 60)
  const directPrice = Number(profile.sessionPrice)
  const legacyPrice = Number(((Number(profile.hourlyRate || 0) / 60) * duration).toFixed(2))

  return {
    duration,
    price: Number.isFinite(directPrice) && directPrice > 0 ? directPrice : legacyPrice,
    currency: String(profile.currency || 'USD').toUpperCase(),
  }
}

const hasUsedFreeTrial = (studentId, tutorId) => SessionBooking.exists({
  student: studentId,
  tutor: tutorId,
  isTrialSession: true,
})

// This authenticated endpoint tells the booking page whether it should display
// the platform's free first session or the tutor's normal paid offer.
const getBookingOffer = async (req, res) => {
  try {
    const tutorProfile = await LiveTutorProfile.findById(req.params.tutorProfileId)
    if (!tutorProfile) return res.status(404).json({ message: 'Tutor profile not found.' })

    const trialAlreadyUsed = await hasUsedFreeTrial(getCurrentUserId(req), tutorProfile.user)
    const paidOffer = getPaidOffer(tutorProfile)
    const isTrialEligible = !trialAlreadyUsed

    return res.status(200).json({
      isTrialEligible,
      offer: isTrialEligible
        ? { label: 'Free introductory session', duration: FREE_TRIAL_DURATION, price: 0, currency: paidOffer.currency }
        : { label: 'Paid session', ...paidOffer },
    })
  } catch (error) {
    console.error('Get booking offer error:', error)
    return res.status(500).json({ message: 'Server error while preparing this booking.' })
  }
}

// The server creates the price and duration itself. This prevents a browser
// from changing a paid price, or pretending it is still eligible for a trial.
const createBooking = async (req, res) => {
  try {
    const studentId = getCurrentUserId(req)
    const { tutorProfileId } = req.params
    const { sessionDate, startTime, studentGoals, studentLevel } = req.body
    const startMinutes = toMinutes(startTime)
    const date = new Date(`${sessionDate}T00:00:00.000Z`)

    if (!sessionDate || startMinutes === null || Number.isNaN(date.getTime())) {
      return res.status(400).json({ message: 'Choose a valid session date and start time.' })
    }
    if (studentLevel && !validLevels.includes(studentLevel)) {
      return res.status(400).json({ message: 'Choose a valid current level.' })
    }

    const tutorProfile = await LiveTutorProfile.findById(tutorProfileId)
    if (!tutorProfile) return res.status(404).json({ message: 'Tutor profile not found.' })
    if (String(tutorProfile.user) === String(studentId)) return res.status(400).json({ message: 'You cannot book a session with yourself.' })

    const availability = await TutorAvailability.findOne({ tutor: tutorProfile.user })
    if (!availability) return res.status(404).json({ message: 'This tutor has not set their availability yet.' })
    if (!availability.isAcceptingBookings) return res.status(400).json({ message: 'This tutor is not accepting bookings at the moment.' })

    const isTrialSession = !(await hasUsedFreeTrial(studentId, tutorProfile.user))
    const paidOffer = getPaidOffer(tutorProfile)
    const duration = isTrialSession ? FREE_TRIAL_DURATION : paidOffer.duration
    const price = isTrialSession ? 0 : paidOffer.price
    const endMinutes = startMinutes + duration

    if (endMinutes > (24 * 60)) return res.status(400).json({ message: 'This session would end after midnight.' })

    const daySlot = availability.weeklySlots.find((slot) => slot.day === bookingDayName(date) && slot.isActive !== false)
    if (!daySlot || startMinutes < toMinutes(daySlot.startTime) || endMinutes > toMinutes(daySlot.endTime)) {
      return res.status(400).json({ message: 'Choose a time inside the tutor’s available hours.' })
    }

    const noticeTime = new Date(Date.now() + (Number(availability.advanceBookingHours || 0) * 60 * 60 * 1000))
    const sessionStartForNotice = new Date(`${sessionDate}T${startTime}:00`)
    if (sessionStartForNotice <= noticeTime) {
      return res.status(400).json({ message: `Sessions must be booked at least ${availability.advanceBookingHours} hours ahead.` })
    }

    const { start: dateStart, end: dateEnd } = dateBounds(date)
    const possibleConflicts = await SessionBooking.find({
      tutor: tutorProfile.user,
      sessionDate: { $gte: dateStart, $lt: dateEnd },
      status: { $nin: ['cancelled'] },
    }).select('startTime endTime')
    const hasConflict = possibleConflicts.some((booking) => (
      startMinutes < toMinutes(booking.endTime) && endMinutes > toMinutes(booking.startTime)
    ))
    if (hasConflict) return res.status(409).json({ message: 'This time slot is already booked. Please choose a different time.' })

    const commission = Number(process.env.PLATFORM_COMMISSION_PERCENTAGE || 20)
    const fees = calculateFees(price, paidOffer.currency, commission)
    const booking = await SessionBooking.create({
      student: studentId,
      tutor: tutorProfile.user,
      tutorProfile: tutorProfile._id,
      subject: tutorProfile.subjects?.[0] || tutorProfile.mainCategory || 'Live tutoring',
      sessionDate: date,
      startTime,
      endTime: toTime(endMinutes),
      duration,
      timezone: availability.timezone,
      studentGoals: String(studentGoals || '').trim(),
      studentLevel: studentLevel || '',
      price,
      currency: paidOffer.currency,
      platformFee: isTrialSession ? 0 : fees.platformFeeAmount,
      tutorEarning: isTrialSession ? 0 : fees.teacherEarningAmount,
      paymentStatus: isTrialSession ? 'not_required' : 'pending',
      paymentMethod: isTrialSession ? 'free_trial' : 'manual',
      status: isTrialSession ? 'confirmed' : 'pending_payment',
      isTrialSession,
    })

    if (isTrialSession) {
      const [student, tutor] = await Promise.all([
        User.findById(studentId).select('name email'),
        User.findById(tutorProfile.user).select('name email'),
      ])
      sendLiveSessionConfirmedEmails(student, tutor, booking).catch((error) => {
        console.error('Free trial confirmation email error:', error)
      })

      return res.status(201).json({
        message: 'Your free 30-minute introductory session is confirmed.',
        booking,
        requiresPayment: false,
      })
    }

    const payment = await Payment.create({
      payer: studentId,
      recipient: tutorProfile.user,
      type: 'session_booking',
      status: 'pending',
      amount: price,
      currency: paidOffer.currency,
      platformFeePercentage: commission,
      platformFeeAmount: fees.platformFeeAmount,
      teacherEarningAmount: fees.teacherEarningAmount,
      booking: booking._id,
      gateway: 'manual',
      paymentMethod: 'manual',
      platformPaymentCode: generatePaymentCode(),
    })

    return res.status(201).json({
      message: 'Booking created. Complete payment to request confirmation.',
      booking: { ...booking.toObject(), payment },
      payment,
      requiresPayment: true,
    })
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'You have already used your free introductory session with this tutor.' })
    }
    console.error('Create session booking error:', error)
    return res.status(500).json({ message: 'Server error while creating booking.' })
  }
}

const confirmBookingPayment = async (req, res) => {
  try {
    const { manualPaymentReference, studentNote, paymentMethod } = req.body
    if (!manualPaymentReference?.trim()) return res.status(400).json({ message: 'Your transaction ID is required.' })

    const booking = await SessionBooking.findById(req.params.bookingId)
    if (!booking) return res.status(404).json({ message: 'Booking not found.' })
    if (String(booking.student) !== String(getCurrentUserId(req))) return res.status(403).json({ message: 'You can only confirm payment for your own booking.' })
    if (booking.isTrialSession || booking.status !== 'pending_payment') return res.status(400).json({ message: 'This booking does not require payment confirmation.' })

    const payment = await Payment.findOne({ booking: booking._id })
    if (!payment) return res.status(404).json({ message: 'Payment record not found.' })
    if (payment.status !== 'pending') return res.status(400).json({ message: 'This payment has already been processed.' })

    payment.manualPaymentReference = manualPaymentReference.trim()
    payment.studentNote = String(studentNote || '').trim()
    if (validPaymentMethods.includes(paymentMethod)) payment.paymentMethod = paymentMethod
    await payment.save()
    booking.paymentReference = payment.manualPaymentReference
    await booking.save()

    return res.status(200).json({ message: 'Payment submitted. Your session will be confirmed after verification.', booking, payment })
  } catch (error) {
    console.error('Confirm booking payment error:', error)
    return res.status(500).json({ message: 'Server error while submitting payment confirmation.' })
  }
}

const adminConfirmBookingPayment = async (req, res) => {
  try {
    const { action } = req.body
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ message: 'Action must be approve or reject.' })

    const booking = await SessionBooking.findById(req.params.bookingId)
    if (!booking) return res.status(404).json({ message: 'Booking not found.' })
    const payment = await Payment.findOne({ booking: booking._id })
    if (!payment) return res.status(404).json({ message: 'Payment record not found.' })

    if (action === 'approve') {
      booking.status = 'confirmed'
      booking.paymentStatus = 'paid'
      payment.status = 'completed'
      payment.verifiedBy = getCurrentUserId(req)
      payment.verifiedAt = new Date()
      await Promise.all([booking.save(), payment.save()])

      const [student, tutor] = await Promise.all([
        User.findById(booking.student).select('name email'),
        User.findById(booking.tutor).select('name email'),
      ])
      sendLiveSessionConfirmedEmails(student, tutor, booking).catch((error) => {
        console.error('Paid booking confirmation email error:', error)
      })

      return res.status(200).json({ message: 'Session booking payment approved.', booking })
    }

    booking.status = 'cancelled'
    booking.cancelledBy = 'admin'
    booking.cancelledAt = new Date()
    payment.status = 'failed'
    await Promise.all([booking.save(), payment.save()])
    return res.status(200).json({ message: 'Session booking payment rejected.', booking })
  } catch (error) {
    console.error('Admin confirm booking payment error:', error)
    return res.status(500).json({ message: 'Server error while reviewing booking payment.' })
  }
}

const getMyBookingsAsStudent = async (req, res) => {
  try {
    const bookings = await SessionBooking.find({ student: getCurrentUserId(req) })
      .populate('tutor', 'name')
      .populate('tutorProfile', 'bio subjects sessionDuration sessionPrice currency')
      .sort({ sessionDate: -1 })
    return res.status(200).json({ bookings })
  } catch (error) {
    console.error('Get student bookings error:', error)
    return res.status(500).json({ message: 'Server error while fetching sessions.' })
  }
}

const getMyBookingsAsTutor = async (req, res) => {
  try {
    const bookings = await SessionBooking.find({ tutor: getCurrentUserId(req) })
      .populate('student', 'name')
      .sort({ sessionDate: 1, startTime: 1 })
    return res.status(200).json({ bookings })
  } catch (error) {
    console.error('Get tutor bookings error:', error)
    return res.status(500).json({ message: 'Server error while fetching sessions.' })
  }
}

const cancelBooking = async (req, res) => {
  try {
    const booking = await SessionBooking.findById(req.params.bookingId)
    if (!booking) return res.status(404).json({ message: 'Booking not found.' })
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'This booking is already cancelled.' })

    const currentUserId = String(getCurrentUserId(req))
    const isStudent = currentUserId === String(booking.student)
    const isTutor = currentUserId === String(booking.tutor)
    const isAdmin = req.user?.role === 'admin'
    if (!isStudent && !isTutor && !isAdmin) return res.status(403).json({ message: 'You cannot cancel this booking.' })

    const availability = await TutorAvailability.findOne({ tutor: booking.tutor })
    const cancellationHours = Number(availability?.cancellationHours ?? 24)
    const sessionStart = new Date(booking.sessionDate)
    const startMinutes = toMinutes(booking.startTime)
    sessionStart.setUTCHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0)
    if (!isAdmin && sessionStart.getTime() - Date.now() <= cancellationHours * 60 * 60 * 1000) {
      return res.status(400).json({ message: `Bookings must be cancelled at least ${cancellationHours} hours before the session.` })
    }

    booking.status = 'cancelled'
    booking.cancelledBy = isStudent ? 'student' : isTutor ? 'tutor' : 'admin'
    booking.cancellationReason = String(req.body.cancellationReason || '').trim()
    booking.cancelledAt = new Date()
    await booking.save()
    return res.status(200).json({ message: 'Booking cancelled successfully.', booking })
  } catch (error) {
    console.error('Cancel booking error:', error)
    return res.status(500).json({ message: 'Server error while cancelling booking.' })
  }
}

module.exports = {
  getBookingOffer,
  createBooking,
  confirmBookingPayment,
  adminConfirmBookingPayment,
  getMyBookingsAsStudent,
  getMyBookingsAsTutor,
  cancelBooking,
}
