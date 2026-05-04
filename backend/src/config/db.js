const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas using MONGO_URI from environment variables.
 * Mongoose handles automatic reconnection.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    throw err;
  }
};

module.exports = connectDB;
