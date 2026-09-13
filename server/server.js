const express = require("express")
require("dotenv").config()
const connectDB = require("./config/db")

const app = express()
const port = process.env.PORT

app.get("/api/health", (req, res) => {
  res.json({ message: "BarakahTech Academy API is running" })
})

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
