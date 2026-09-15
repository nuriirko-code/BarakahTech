const express = require("express")
require("dotenv").config()
const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes")

const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(express.json())

// Routes
app.get("/api/health", (req, res) => {
  res.json({ message: "BarakahTech Academy API is running" })
})
app.use("/api/auth", authRoutes)

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