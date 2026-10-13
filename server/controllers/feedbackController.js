const DailyFeedback = require('../models/DailyFeedback')
const EarningsLedger = require('../models/EarningsLedger')
const Payment = require('../models/Payment')

const submitDailyFeedback = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?.userId
    const {
      teacherId,
      courseId,
      bookingId,
      date,
      rating,
      wasHelpful,
      comment,
      wouldRecommend,
    } = req.body

    if (!teacherId || !date || rating === undefined || wasHelpful === undefined) {
      return res.status(400).json({ message: 'Teacher, date, rating, and helpfulness are required' })
    }

    // We look up the ledger entry before creating feedback because the financial decision needs
    // a single source of truth: the exact day that produced the teacher’s earnings.
    const ledgerDate = new Date(date)
    const earningsEntry = await EarningsLedger.findOne({
      teacher: teacherId,
      student: studentId,
      date: {
        $gte: new Date(ledgerDate.setHours(0, 0, 0, 0)),
        $lt: new Date(ledgerDate.setHours(23, 59, 59, 999)),
      },
    })

    if (!earningsEntry) {
      return res.status(404).json({ message: 'No earnings record found for this date' })
    }

    const existingFeedback = await DailyFeedback.findOne({
      student: studentId,
      teacher: teacherId,
      date: {
        $gte: new Date(ledgerDate.setHours(0, 0, 0, 0)),
        $lt: new Date(ledgerDate.setHours(23, 59, 59, 999)),
      },
    })

    if (existingFeedback) {
      return res.status(400).json({ message: 'You have already submitted feedback for this session' })
    }

    const feedback = await DailyFeedback.create({
      student: studentId,
      teacher: teacherId,
      course: courseId || null,
      booking: bookingId || null,
      earningsLedgerEntry: earningsEntry._id,
      date: ledgerDate,
      rating,
      wasHelpful,
      comment: comment || '',
      wouldRecommend: wouldRecommend !== false,
      resolution: 'pending',
    })

    if (wasHelpful) {
      // A positive response releases the day's earnings automatically and records the approval time.
      earningsEntry.status = 'approved'
      earningsEntry.approvedByFeedback = true
      earningsEntry.feedbackSubmittedAt = new Date()
      await earningsEntry.save()

      feedback.resolution = 'earnings_released'
      feedback.resolvedAt = new Date()
      await feedback.save()

      return res.status(201).json({
        message: 'Daily feedback submitted. Earnings released to the teacher.',
        feedback,
        resolution: 'earnings_released',
      })
    }

    // Record the refund outcome in the ledger, but remember that this does not transfer money back.
    // Staff must process the actual refund manually until a payment-provider refund workflow exists.
    earningsEntry.status = 'refunded'
    await earningsEntry.save()
 
    const payment = await Payment.findById(earningsEntry.payment)
    if (payment) {
      payment.status = 'refunded'
      await payment.save()
    }

    feedback.resolution = 'refund_issued'
    feedback.resolvedAt = new Date()
    await feedback.save()

    return res.status(201).json({
      message: 'Daily feedback submitted. The day was refunded.',
      feedback,
      resolution: 'refund_issued',
    })
  } catch (error) {
    console.error('Submit daily feedback error:', error)
    return res.status(500).json({ message: 'Server error while submitting daily feedback' })
  }
}

const getMyFeedback = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?.userId
    const feedback = await DailyFeedback.find({ student: studentId })
      .populate('teacher', 'name')
      .sort({ date: -1 })

    return res.status(200).json({ feedback })
  } catch (error) {
    console.error('Get my feedback error:', error)
    return res.status(500).json({ message: 'Server error while loading feedback' })
  }
}

const getTeacherFeedbackSummary = async (req, res) => {
  try {
    const teacherId = req.user?.id || req.user?.userId
    const feedbackEntries = await DailyFeedback.find({ teacher: teacherId })

    const totalFeedback = feedbackEntries.length
    const positiveFeedback = feedbackEntries.filter((entry) => entry.wasHelpful).length
    const satisfactionRate = totalFeedback === 0 ? 0 : (positiveFeedback / totalFeedback) * 100
    const averageRating = totalFeedback === 0
      ? 0
      : feedbackEntries.reduce((sum, entry) => sum + Number(entry.rating || 0), 0) / totalFeedback

    // Satisfaction rate is a reputation metric for teachers. It shows whether learners
    // found the teaching valuable, not just whether they liked the interface or gave random scores.
    return res.status(200).json({
      summary: {
        totalFeedback,
        positiveFeedback,
        satisfactionRate: Number(satisfactionRate.toFixed(2)),
        averageRating: Number(averageRating.toFixed(2)),
      },
    })
  } catch (error) {
    console.error('Get teacher feedback summary error:', error)
    return res.status(500).json({ message: 'Server error while loading teacher feedback summary' })
  }
}

module.exports = {
  submitDailyFeedback,
  getMyFeedback,
  getTeacherFeedbackSummary,
}
