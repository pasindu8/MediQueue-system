const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // process.exit(1) ඉවත් කර Error එක Throw කරන්න
    throw error;
  }
};

module.exports = connectDB;