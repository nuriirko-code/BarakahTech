const TutorAvailability = require('../models/TutorAvailability')
const LiveTutorProfile = require('../models/LiveTutorProfile')

const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const validTime = /^([01]\d|2[0-3]):[0-5]\d$/
const numberOrDefault = (value, fallback, minimum = 0) => {
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) && parsedValue >= minimum ? parsedValue : fallback
}

const getMyAvailability = async (req, res) => {
  try {
    const availability = await TutorAvailability.findOne({ tutor: req.user.userId })

    // null is a valid first-time state, not an error: the tutor simply has not
    // created a working schedule yet.
    return res.status(200).json({ availability })
  } catch (error) {
    console.error('Get tutor availability error:', error)
    return res.status(500).json({ message: 'Server error while fetching availability' })
  }
}

const saveAvailability = async (req, res) => {
  try {
    const tutorId = req.user.userId
    const {
      timezone,
      weeklySlots,
      advanceBookingHours,
      cancellationHours,
      bufferMinutes,
      maxDailySession,
      isAcceptingBookings,
    } = req.body

    if (!timezone) {
      return res.status(400).json({ message: 'Choose the timezone where you teach.' })
    }

    if (!Array.isArray(weeklySlots) || weeklySlots.length === 0) {
      return res.status(400).json({ message: 'Choose at least one available day.' })
    }

    const hasInvalidSlot = weeklySlots.some((slot) => (
      !slot?.day ||
      !validDays.includes(slot.day) ||
      !validTime.test(slot.startTime || '') ||
      !validTime.test(slot.endTime || '') ||
      slot.startTime >= slot.endTime
    ))

    if (hasInvalidSlot) {
      return res.status(400).json({ message: 'Each schedule row needs a valid day, start time, and later end time.' })
    }

    if (new Set(weeklySlots.map((slot) => slot.day)).size !== weeklySlots.length) {
      return res.status(400).json({ message: 'Each day can appear only once in your weekly schedule.' })
    }

    const liveTutorProfile = await LiveTutorProfile.findOne({ user: tutorId })
    if (!liveTutorProfile) {
      return res.status(404).json({ message: 'Approved live tutor profile not found.' })
    }

    // upsert: true means MongoDB inserts the first schedule and updates the
    // same tutor's document on later saves instead of creating duplicates.
    const availability = await TutorAvailability.findOneAndUpdate(
      { tutor: tutorId },
      {
        tutor: tutorId,
        liveTutorProfile: liveTutorProfile._id,
        timezone,
        weeklySlots,
        advanceBookingHours: numberOrDefault(advanceBookingHours, 24),
        cancellationHours: numberOrDefault(cancellationHours, 24),
        // Zero is a valid choice here, so || cannot be used: it would turn a
        // deliberate 0-minute buffer back into the default 15 minutes.
        bufferMinutes: numberOrDefault(bufferMinutes, 15),
        maxDailySession: numberOrDefault(maxDailySession, 8, 1),
        isAcceptingBookings: isAcceptingBookings !== undefined ? isAcceptingBookings : true,
      },
      { upsert: true, new: true, runValidators: true }
    )

    return res.status(200).json({ message: 'Availability saved successfully', availability })
  } catch (error) {
    console.error('Save tutor availability error:', error)
    return res.status(500).json({ message: 'Server error while saving availability' })
  }
}

const getTutorAvailability = async (req, res) => {
  try {
    const availability = await TutorAvailability.findOne({ tutor: req.params.tutorId })

    if (!availability) {
      return res.status(404).json({ message: 'This tutor has not set their availability yet' })
    }

    // This endpoint is public because students must be able to inspect a
    // tutor's times before deciding whether to register or book a session.
    if (!availability.isAcceptingBookings) {
      return res.status(200).json({
        message: 'This tutor is not accepting bookings at the moment',
        isAcceptingBookings: false,
      })
    }

    return res.status(200).json({ availability })
  } catch (error) {
    console.error('Get public tutor availability error:', error)
    return res.status(500).json({ message: 'Server error while fetching tutor availability' })
  }
}

module.exports = { getMyAvailability, saveAvailability, getTutorAvailability }
