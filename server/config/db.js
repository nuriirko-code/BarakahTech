const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB connected successfully")
  } catch (error) {
    console.error(
      "MongoDB connection failed. Check MONGO_URI and MongoDB availability."
    )
    throw error
  }
}

module.exports = connectDB
