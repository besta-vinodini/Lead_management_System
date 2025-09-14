#!/bin/bash

echo "🚀 Setting up Lead Management System - MERN Stack"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cat > backend/.env << EOF
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MONGODB_URI=mongodb://localhost:27017/lead-management-system
EOF
    echo "📝 Created backend/.env file with local MongoDB URI"
    echo "🔧 Please update MONGODB_URI with your MongoDB Atlas connection string"
fi

echo ""
echo "🎯 MERN Stack Setup Complete!"
echo "============================="
echo ""
echo "Next Steps:"
echo "1. Update backend/.env with your MongoDB Atlas URI"
echo "2. Run: npm run dev (to start both services)"
echo ""
echo "MongoDB Atlas Setup:"
echo "1. Go to https://www.mongodb.com/atlas"
echo "2. Create a free cluster"
echo "3. Get your connection string"
echo "4. Update MONGODB_URI in backend/.env"
echo ""
echo "Test Credentials:"
echo "Email: test@example.com"
echo "Password: test123"
echo ""
echo "URLs:"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo ""

