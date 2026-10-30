const express = require("express")
const cors = require("cors")
require("dotenv").config({ path: require("path").join(__dirname, ".env") })
const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const teacherApplicationRoutes = require("./routes/teacherApplicationRoutes")
const teacherRoutes = require("./routes/teacherRoutes")
const courseRoutes = require("./routes/courseRoutes")
const adminRoutes = require("./routes/adminRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const feedbackRoutes = require("./routes/feedbackRoutes")
const messageRoutes = require("./routes/messageRoutes")
const liveTutorRoutes = require("./routes/liveTutorRoutes")
const availabilityRoutes = require("./routes/availabilityRoutes")
const bookingRoutes = require("./routes/bookingRoutes")
const landingRoutes = require("./routes/landingRoutes")

const app = express()
const port = process.env.PORT || 5000

// Middleware
// CORS restricts which browser origins may call the API with a user's credentials.
// Local development may use Vite's alternate ports; production trusts only FRONTEND_URL.
const allowedOrigins = (
  process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL]
    : [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        process.env.FRONTEND_URL,
      ]
).filter(Boolean) // Remove undefined configuration values when FRONTEND_URL is unset.

const corsOptions = {
  origin: (origin, callback) => {
    // Non-browser clients such as Postman and server-to-server callers have no Origin header.
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error(`CORS policy: Origin ${origin} not allowed`))
  },
  // Required for credentialed cross-origin requests; API bearer tokens are sent in Authorization.
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))

app.use(express.json({ limit: '3mb' }))

// Routes
app.get("/api/health", (req, res) => {
  res.json({ message: "Barakah Academy API is running" })
})
app.use("/api/landing", landingRoutes)
app.use("/api/auth", authRoutes)
// Express prefixes each route in this router with /api/teacher-applications.
app.use("/api/teacher-applications", teacherApplicationRoutes)
app.use("/api/teachers", teacherRoutes)
// Express adds this prefix to every path defined in the course router.
app.use("/api/courses", courseRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/feedback", feedbackRoutes)
app.use("/api/messages", messageRoutes)
// Live tutor applications are reviewed by admins and create a separate public
// tutor profile; they are distinct from course-teacher applications.
app.use("/api/live-tutors", liveTutorRoutes)
app.use("/api/availability", availabilityRoutes)
app.use("/api/bookings", bookingRoutes)
// User-management routes are isolated behind the /api/admin prefix.
app.use("/api/admin", adminRoutes)

// Requests reaching this middleware did not match a registered route.
app.use((req, res) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.url}` })
})

// Keep error handling last so route and middleware failures share a safe response shape.
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error.stack || error)

  if (error.message?.startsWith('CORS policy:')) {
    return res.status(403).json({ message: 'CORS error: Origin not allowed' })
  }

  const statusCode = error.statusCode || 500
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : error.message

  return res.status(statusCode).json({ message })
})

const startServer = async () => {
  await connectDB()

  app.listen(port, () => {
    console.log(`Barakah Academy API is running on port ${port}`)
  })
}

startServer().catch(() => {
  console.error("Server could not start because the database connection failed.")
  process.exit(1)
})
