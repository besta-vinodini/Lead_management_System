const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Database connection error:', error);
    console.error('Please check:');
    console.error('1. MongoDB Atlas IP whitelist includes your current IP');
    console.error('2. Database user credentials are correct');
    console.error('3. Network connectivity');
    process.exit(1);
  }
};

module.exports = { connectDB };