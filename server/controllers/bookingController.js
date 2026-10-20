const SessionBooking = require('../models/SessionBooking')
const LiveTutorProfile = require('../models/LiveTutorProfile')
const TutorAvailability = require('../models/TutorAvailability')
const Payment = require('../models/Payment')
const { calculateFees, generatePaymentCode } = require('../utils/paymentUtils')

const getCurrentUserId = (req) => req.user?.userId || req.user?.id
const validLevels = ['beginner', 'intermediate', 'advanced']
const validPaymentMethods = ['telebirr', 'cbe_birr', 'other_mobile', 'manual']

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

// Conflicts are checked on the server rather than trusting displayed UI slots;
// two students could otherwise submit the same time at nearly the same moment.
const createBooking = async (req, res) => {
  try {
    const studentId = getCurrentUserId(req)
    const { tutorProfileId } = req.params
    const { subject, sessionDate, startTime, duration, studentGoals, studentLevel, paymentMethod } = req.body
    const durationNumber = Number(duration)
    const startMinutes = toMinutes(startTime)
    const date = new Date(`${sessionDate}T00:00:00.000Z`)

    if (!subject?.trim() || !sessionDate || startMinutes === null || !Number.isFinite(durationNumber) || durationNumber <= 0 || Number.isNaN(date.getTime())) {
      return res.status(400).json({ message: 'Subject, date, start time, and duration are required.' })
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
    if (!tutorProfile.sessionDurations.includes(durationNumber)) return res.status(400).json({ message: 'Choose one of this tutor’s offered session durations.' })

    const endMinutes = startMinutes + durationNumber
    if (endMinutes > (24 * 60)) return res.status(400).json({ message: 'This session would end after midnight.' })
    const daySlot = availability.weeklySlots.find((slot) => slot.day === bookingDayName(date) && slot.isActive !== false)
    if (!daySlot || startMinutes < toMinutes(daySlot.startTime) || endMinutes > toMinutes(daySlot.endTime)) {
      return res.status(400).json({ message: 'Choose a time inside the tutor’s available hours.' })
    }

    const noticeTime = new Date(Date.now() + (Number(availability.advanceBookingHours || 0) * 60 * 60 * 1000))
    const sessionStartForNotice = new Date(`${sessionDate}T${startTime}:00`)
    if (sessionStartForNotice <= noticeTime) return res.status(400).json({ message: `Sessions must be booked at least ${availability.advanceBookingHours} hours ahead.` })

    const { start: dateStart, end: dateEnd } = dateBounds(date)
    const possibleConflicts = await SessionBooking.find({
      tutor: tutorProfile.user,
      sessionDate: { $gte: dateStart, $lt: dateEnd },
      status: { $nin: ['cancelled'] },
    }).select('startTime endTime')
    const conflicts = possibleConflicts.some((booking) => startMinutes < toMinutes(booking.endTime) && endMinutes > toMinutes(booking.startTime))
    if (conflicts) return res.status(409).json({ message: 'This time slot is already booked. Please choose a different time.' })

    const price = Number(((Number(tutorProfile.hourlyRate) / 60) * durationNumber).toFixed(2))
    const currency = String(tutorProfile.currency || 'USD').toUpperCase()
    const fees = calculateFees(price, currency, Number(process.env.PLATFORM_COMMISSION_PERCENTAGE || 20))
    const platformPaymentCode = generatePaymentCode()
    const safePaymentMethod = validPaymentMethods.includes(paymentMethod) ? paymentMethod : 'manual'

    const booking = await SessionBooking.create({
      student: studentId,
      tutor: tutorProfile.user,
      tutorProfile: tutorProfile._id,
      subject: subject.trim(),
      sessionDate: date,
      startTime,
      endTime: toTime(endMinutes),
      duration: durationNumber,
      timezone: availability.timezone,
      studentGoals: String(studentGoals || '').trim(),
      studentLevel: studentLevel || '',
      price,
      currency,
      platformFee: fees.platformFeeAmount,
      tutorEarning: fees.teacherEarningAmount,
      paymentMethod: safePaymentMethod,
    })

    const payment = await Payment.create({
      payer: studentId,
      recipient: tutorProfile.user,
      type: 'session_booking',
      status: 'pending',
      amount: price,
      currency,
      platformFeePercentage: Number(process.env.PLATFORM_COMMISSION_PERCENTAGE || 20),
      platformFeeAmount: fees.platformFeeAmount,
      teacherEarningAmount: fees.teacherEarningAmount,
      booking: booking._id,
      gateway: 'manual',
      paymentMethod: safePaymentMethod,
      platformPaymentCode,
    })

    return res.status(201).json({ message: 'Booking created. Complete payment to request confirmation.', booking: { ...booking.toObject(), payment }, payment })
  } catch (error) {
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
    if (booking.status !== 'pending_payment') return res.status(400).json({ message: 'This booking is no longer awaiting payment.' })

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
      .populate('tutorProfile', 'bio subjects hourlyRate currency')
      .sort({ sessionDate: -1 })
    return res.status(200).json({ bookings })
  } catch (error) {
    console.error('Get student bookings error:', error)
    return res.status(500).json({ message: 'Server error while fetching sessions.' })
  }
}

const getMyBookingsAsTutor = async (req, res) => {
  try {
    // Ascending date order gives tutors their nearest upcoming commitments first.
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

module.exports = { createBooking, confirmBookingPayment, adminConfirmBookingPayment, getMyBookingsAsStudent, getMyBookingsAsTutor, cancelBooking }
