require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const crypto = require('crypto')
const mongoose = require('mongoose')
const CommunitySession = require('../models/CommunitySession')
const User = require('../models/User')

const getDateAt = (daysFromNow, hour = 15) => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  date.setHours(hour, 0, 0, 0)
  return date
}

const getMeetingUrl = () => (
  `https://meet.jit.si/barakah-community-${crypto.randomBytes(6).toString('hex')}`
)

const seedCommunity = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI
  if (!mongoUri) {
    throw new Error('Set MONGODB_URI or MONGO_URI in server/.env before seeding community sessions.')
  }

  await mongoose.connect(mongoUri)
  const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 }).select('_id')
  if (!admin) {
    throw new Error('Create an admin account before seeding community sessions.')
  }

  // Only demo-prefixed community sessions are replaced; real community sessions remain untouched.
  await CommunitySession.deleteMany({ title: /^\[Demo\]/ })

  const sessions = [
    {
      title: '[Demo] Idea Lab: Find a problem worth solving',
      description: 'A sample recap showing how the community turns everyday challenges into practical project ideas.',
      type: 'idea_lab',
      startsAt: getDateAt(-5),
      durationMinutes: 60,
      capacity: 10,
      facilitatorName: 'Barakah Academy Team',
      agenda: [
        { minutes: 5, activity: 'Welcome and introductions' },
        { minutes: 10, activity: 'Share everyday problems' },
        { minutes: 15, activity: 'Brainstorm possible solutions' },
        { minutes: 15, activity: 'Discuss customers and feasibility' },
        { minutes: 10, activity: 'Choose ideas to explore' },
        { minutes: 5, activity: 'Agree on next steps' },
      ],
      status: 'completed',
      recommendedCategory: 'business',
      outcomes: {
        summary: 'Participants practiced observing local needs, talking with potential users, and selecting small ideas that can be tested.',
        problemStatements: [
          'Farmers in rural towns cannot easily compare fair crop prices.',
          'Students struggle to find affordable tutors who teach in their language.',
          'Small shops lose potential customers because they have no online presence.',
        ],
        resources: [
          {
            title: 'Market research and competitive analysis',
            url: 'https://www.sba.gov/business-guide/plan-your-business/market-research-competitive-analysis',
          },
          {
            title: 'How to talk to users',
            url: 'https://www.ycombinator.com/library/4D-how-to-talk-to-users',
          },
        ],
        nextSteps: [
          'Interview three people who experience one of the problems.',
          'Write down what they do today and what is still difficult.',
          'Bring one testable solution idea to the next Idea Lab.',
        ],
      },
      createdBy: admin._id,
      meetingUrl: getMeetingUrl(),
    },
    {
      title: '[Demo] Weekly Idea Lab: From local problem to first test',
      description: 'Bring one challenge from your school, neighborhood, or work. Together we will understand who it affects, brainstorm ideas, and choose a small next step.',
      type: 'idea_lab',
      startsAt: getDateAt(2),
      durationMinutes: 60,
      capacity: 10,
      facilitatorName: 'Barakah Academy Team',
      guestMentor: { name: 'Guest Entrepreneur', title: 'Startup Founder' },
      agenda: [
        { minutes: 5, activity: 'Welcome and introductions' },
        { minutes: 10, activity: 'Find real problems' },
        { minutes: 15, activity: 'Brainstorm possible solutions' },
        { minutes: 15, activity: 'Discuss customers and feasibility' },
        { minutes: 10, activity: 'Choose ideas to explore' },
        { minutes: 5, activity: 'Agree on next steps' },
      ],
      status: 'scheduled',
      recommendedCategory: 'business',
      createdBy: admin._id,
      meetingUrl: getMeetingUrl(),
    },
    {
      title: '[Demo] Build Your First Project',
      description: 'Turn a validated idea into a small working project. Choose the skills you need, make a simple first version, and get feedback from the community.',
      type: 'build_project',
      startsAt: getDateAt(5),
      durationMinutes: 90,
      capacity: 10,
      facilitatorName: 'Barakah Academy Team',
      agenda: [
        { minutes: 10, activity: 'Choose a problem and target user' },
        { minutes: 20, activity: 'Sketch the smallest useful solution' },
        { minutes: 35, activity: 'Build a first project plan' },
        { minutes: 15, activity: 'Share plans and receive feedback' },
        { minutes: 10, activity: 'Choose skills to learn and next steps' },
      ],
      status: 'scheduled',
      recommendedCategory: 'technology',
      createdBy: admin._id,
      meetingUrl: getMeetingUrl(),
    },
  ]

  const createdSessions = await CommunitySession.insertMany(sessions)
  console.log(`Seeded ${createdSessions.length} demo community sessions.`)
}

seedCommunity()
  .catch((error) => {
    console.error('Community session seed failed:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
