const { connectDB } = require('./database');
const User = require('./models/User');
const Lead = require('./models/Lead');

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    await connectDB();
    
    // Test User model
    const userCount = await User.countDocuments();
    console.log(`Users in database: ${userCount}`);
    
    // Test Lead model
    const leadCount = await Lead.countDocuments();
    console.log(`Leads in database: ${leadCount}`);
    
    console.log('✅ MongoDB connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();

