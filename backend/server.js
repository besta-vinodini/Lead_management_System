// ---------------------
// Imports
// ---------------------
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

// ---------------------
// Security middleware
// ---------------------
app.use(helmet());

// ---------------------
// Rate limiting
// ---------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health'
});
app.use(limiter);

// ---------------------
// CORS configuration
// ---------------------
const defaultOrigins = ['http://localhost:3000'];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : defaultOrigins;

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// ---------------------
// Body parsing + cookies
// ---------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------------------
// Logging
// ---------------------
app.use(morgan('combined'));

// ---------------------
// Health check
// ---------------------
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ---------------------
// Root route
// ---------------------
app.get('/', (req, res) => {
  res.json({ message: 'Backend running!', allowedOrigins });
});

// ---------------------
// API routes
// ---------------------
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// ---------------------
// Error handling
// ---------------------
app.use((err, req, res, next) => {
  console.error('Error:', err.message || err);
  res.status(500).json({ error: 'Internal server error' });
});

// ---------------------
// 404 handler
// ---------------------
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ---------------------
// Run locally only
// ---------------------
if (!process.env.VERCEL) {
  const startServer = async () => {
    try {
      await connectDB();
      if (process.env.NODE_ENV === 'development') {
        await seedDatabase();
      }
      const PORT = config.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`🌍 Environment: ${config.NODE_ENV}`);
        // Safer logging: don’t print password
        if (config.MONGODB_URI) {
          try {
            const uri = new URL(config.MONGODB_URI);
            console.log(`📦 MongoDB connected: ${uri.host}${uri.pathname}`);
          } catch {
            console.log(`📦 MongoDB URI loaded`);
          }
        }
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  };
  startServer();
}

// ---------------------
// Export for Vercel
// ---------------------
module.exports = app;
