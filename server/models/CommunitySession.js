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
      enum: ['idea_lab', 'build_project', 'mentor_review', 'showcase'],
      default: 'idea_lab',
    },
    startsAt: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, default: 60, min: 1 },
    capacity: { type: Number, default: 10, min: 2, max: 50 },
    facilitatorName: { type: String, required: true, trim: true },
    guestMentor: {
      name: { type: String, trim: true },
      title: { type: String, trim: true },
    },
    agenda: { type: [agendaItemSchema], default: [] },
    // Keep the room URL in the database, but expose it only through the
    // authenticated join endpoint after registration and the opening time.
    meetingUrl: { type: String, required: true, select: false },
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
      enum: ['technology', 'languages', 'sciences', 'business', 'leadership'],
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
