#!/bin/bash

echo "🚀 Starting Lead Management System..."
echo "=================================="

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

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm run install-all

# Seed the database
echo "🌱 Seeding database with test data..."
npm run seed

echo ""
echo "🎯 Starting both frontend and backend..."
echo "Backend will run on: http://localhost:5000"
echo "Frontend will run on: http://localhost:3000"
echo ""
echo "Test credentials:"
echo "Email: test@example.com"
echo "Password: test123"
echo ""
echo "Press Ctrl+C to stop both services"
echo "=================================="

# Start both services
npm run dev

