const SessionFeedback = require('../models/SessionFeedback')
const SessionBooking = require('../models/SessionBooking')
const LiveTutorProfile = require('../models/LiveTutorProfile')
const EarningsLedger = require('../models/EarningsLedger')
const Payment = require('../models/Payment')

const getCurrentUserId = (req) => req.user?.userId || req.user?.id

// Tutor completion is the boundary that unlocks the student's financial
// feedback decision: tutor marks complete -> student responds -> earnings are
// approved or the payment is marked for manual refund processing.
const markSessionComplete = async (req, res) => {
  try {
    const booking = await SessionBooking.findById(req.params.bookingId)
    if (!booking) return res.status(404).json({ message: 'Session booking not found.' })
    if (String(booking.tutor) !== String(getCurrentUserId(req))) {
      return res.status(403).json({ message: 'You can only complete your own tutoring sessions.' })
    }
    if (booking.status === 'completed') return res.status(400).json({ message: 'This session is already marked as complete.' })
    if (booking.status !== 'confirmed' && booking.status !== 'in_progress') {
      return res.status(400).json({ message: 'Only confirmed sessions can be marked complete.' })
    }

    booking.status = 'completed'
    await booking.save()
    return res.status(200).json({ message: 'Session marked as complete. Student can now submit feedback.', booking })
  } catch (error) {
    console.error('Mark session complete error:', error)
    return res.status(500).json({ message: 'Server error while completing this session.' })
  }
}

const submitSessionFeedback = async (req, res) => {
  try {
    const studentId = getCurrentUserId(req)
    const rating = Number(req.body.rating)
    const { wasHelpful, comment, wouldBookAgain } = req.body
    const isPublic = req.body.isPublic === true

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Choose a rating from 1 to 5.' })
    }
    if (typeof wasHelpful !== 'boolean') {
      return res.status(400).json({ message: 'Tell us whether the session was helpful.' })
    }

    const booking = await SessionBooking.findById(req.params.bookingId)
    if (!booking) return res.status(404).json({ message: 'Session booking not found.' })
    if (String(booking.student) !== String(studentId)) {
      return res.status(403).json({ message: 'You can only submit feedback for your own session.' })
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Feedback is available after the tutor marks this session complete.' })
    }

    const existingFeedback = await SessionFeedback.findOne({ booking: booking._id })
    if (existingFeedback) return res.status(400).json({ message: 'Feedback has already been submitted for this session.' })

    // A paid booking must have an accepted Payment record. Free introductory
    // sessions intentionally have no payment or ledger entry to release.
    const payment = await Payment.findOne({ booking: booking._id })
    if (!booking.isTrialSession && !payment) {
      return res.status(409).json({ message: 'This paid session has no payment record. Please contact support.' })
    }

    const feedback = await SessionFeedback.create({
      booking: booking._id,
      student: studentId,
      tutor: booking.tutor,
      rating,
      wasHelpful,
      comment: String(comment || '').trim(),
      isPublic,
      wouldBookAgain: wouldBookAgain !== false,
    })

    booking.feedbackSubmitted = true
    feedback.resolvedAt = new Date()

    if (wasHelpful) {
      if (payment) {
        // Payment may already be completed after administrator verification;
        // the separate ledger entry records that its tutor share is approved.
        if (payment.status !== 'completed') payment.status = 'completed'
        await EarningsLedger.create({
          teacher: booking.tutor,
          student: booking.student,
          payment: payment._id,
          booking: booking._id,
          date: new Date(),
          grossAmount: payment.amount,
          platformFeeAmount: payment.platformFeeAmount,
          netAmount: payment.teacherEarningAmount,
          currency: payment.currency,
          status: 'approved',
          approvedByFeedback: true,
          feedbackSubmittedAt: new Date(),
        })
      }

      booking.tutorEarningReleased = true
      feedback.resolution = 'earnings_released'

      // Ratings are updated only after a helpful-session confirmation so the
      // public tutor score represents verified, positive learning outcomes.
      const profile = await LiveTutorProfile.findOne({ user: booking.tutor })
      if (profile) {
        const oldCount = Number(profile.totalRatings || 0)
        const newCount = oldCount + 1
        profile.rating = Number((((Number(profile.rating || 0) * oldCount) + rating) / newCount).toFixed(2))
        profile.totalRatings = newCount
        await profile.save()
      }
    } else {
      // This records the refund outcome. With the current manual payment MVP,
      // staff still send the actual transfer outside the application.
      if (payment) {
        payment.status = 'refunded'
        await payment.save()
      }
      feedback.resolution = 'refund_issued'
    }

    await Promise.all([booking.save(), feedback.save()])

    const isFreeTrial = booking.isTrialSession || Number(booking.price) === 0
    return res.status(201).json({
      message: wasHelpful
        ? (isFreeTrial ? 'Feedback submitted. Thank you for confirming this introductory session.' : 'Feedback submitted. Tutor earnings have been approved.')
        : (isFreeTrial ? 'Feedback submitted. No payment was taken for this introductory session.' : 'Feedback submitted. The payment is marked for refund processing.'),
      feedback,
      resolution: feedback.resolution,
    })
  } catch (error) {
    if (error?.code === 11000) return res.status(400).json({ message: 'Feedback has already been submitted for this session.' })
    console.error('Submit session feedback error:', error)
    return res.status(500).json({ message: 'Server error while submitting session feedback.' })
  }
}

module.exports = { submitSessionFeedback, markSessionComplete }
