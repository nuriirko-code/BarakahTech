const mongoose = require('mongoose')

const agendaItemSchema = new mongoose.Schema(
  {
    minutes: { type: Number, required: true, min: 1 },
    activity: { type: String, required: true, trim: true },
  },
  { _id: false }
)

const participantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    registeredAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false }
)

const communitySessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['idea_lab', 'build_project', 'mentor_review', 'showcase', 'course_mentorship'],
      default: 'idea_lab',
    },
    // Mentorship reuses the same seat limit, atomic registration, and live room
    // as community sessions, with only course ownership and host fields added.
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    hostUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    startsAt: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, default: 60, min: 1 },
    capacity: { type: Number, default: 10, min: 1, max: 50 },
    facilitatorName: { type: String, required: true, trim: true },
    guestMentor: {
      name: { type: String, trim: true },
      title: { type: String, trim: true },
    },
    agenda: { type: [agendaItemSchema], default: [] },
    meetingUrl: { type: String, default: '', select: false },
    // scheduled: announced; live: in progress; completed: outcomes available;
    // cancelled: will not take place. This lifecycle controls registration/join.
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    // Embedding registrations lets MongoDB atomically compare the seat limit
    // and append a participant, so simultaneous last-seat requests cannot win twice.
    participants: {
      type: [participantSchema],
      default: [],
    },
    recommendedCategory: {
      type: String,
      trim: true,
      default: 'business',
    },
    outcomes: {
      summary: { type: String, default: '' },
      problemStatements: { type: [String], default: [] },
      resources: { type: [resourceSchema], default: [] },
      nextSteps: { type: [String], default: [] },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

communitySessionSchema.index({ startsAt: 1, status: 1 })

const CommunitySession = mongoose.model('CommunitySession', communitySessionSchema)

module.exports = CommunitySession
