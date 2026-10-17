const express = require("express")
const cors = require("cors")
require("dotenv").config()
const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const teacherApplicationRoutes = require("./routes/teacherApplicationRoutes")
const teacherRoutes = require("./routes/teacherRoutes")
const courseRoutes = require("./routes/courseRoutes")
const adminRoutes = require("./routes/adminRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const feedbackRoutes = require("./routes/feedbackRoutes")
const messageRoutes = require("./routes/messageRoutes")

const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(cors({ origin: "http://localhost:5173" }))

app.use(express.json({ limit: '3mb' }))

// Routes
app.get("/api/health", (req, res) => {
  res.json({ message: "BarakahTech Academy API is running" })
})
app.use("/api/auth", authRoutes)
// Express prefixes each route in this router with /api/teacher-applications.
app.use("/api/teacher-applications", teacherApplicationRoutes)
app.use("/api/teachers", teacherRoutes)
// Express adds this prefix to every path defined in the course router.
app.use("/api/courses", courseRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/feedback", feedbackRoutes)
app.use("/api/messages", messageRoutes)
// User-management routes are isolated behind the /api/admin prefix.
app.use("/api/admin", adminRoutes)

const startServer = async () => {
  await connectDB()

  app.listen(port, () => {
    console.log(`BarakahTech Academy API is running on port ${port}`)
  })
}

startServer().catch(() => {
  console.error("Server could not start because the database connection failed.")
  process.exit(1)
})
