const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./database');
const { seedDatabase } = require('./seed');
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const config = require('./config');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health'
});
app.use(limiter);


const corsOptions = {
  origin: [
    'https://lead-management-system-beta-ten.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // 👈 Add this line to handle preflight requests


// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('Backend is running');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await connectDB();

    if (process.env.NODE_ENV === 'development') {
      await seedDatabase();
    }

    console.log('Database connected successfully');
  } catch (error) {
    console.error('Failed to start server:', error);
    throw error; // Don't exit process on Vercel
  }
};

startServer();
const serverless = require('serverless-http');

module.exports = app;
module.exports.handler = serverless(app);


