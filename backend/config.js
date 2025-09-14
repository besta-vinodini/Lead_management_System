require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'vinodini',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://rr200438_db_user:vinodini%402026@leadmanagementsystem.gjgmnoe.mongodb.net/lead-management-system?retryWrites=true&w=majority'
};