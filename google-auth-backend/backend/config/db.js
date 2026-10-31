const mongoose = require('mongoose');

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is not set; user profiles will not be persisted.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exitCode = 1;
  }
}

module.exports = connectDB;
