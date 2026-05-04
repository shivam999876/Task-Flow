const mongoose = require("mongoose");

/**
 * Connects to MongoDB Atlas using MONGO_URI from environment variables.
 * Mongoose handles automatic reconnection.
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      const message =
        "Missing MongoDB connection string. Set MONGO_URI or MONGODB_URI in the environment.";
      console.error(`❌ MongoDB connection error: ${message}`);
      throw new Error(message);
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    throw err;
  }
};

module.exports = connectDB;
