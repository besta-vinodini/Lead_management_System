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
// Allowed origins
// ---------------------
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [
      'https://lead-management-system-beta-ten.vercel.app',
      'http://localhost:3000'
    ];

// ---------------------
// CORS setup (single source of truth)
// ---------------------
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman/curl
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.error("❌ Blocked by CORS:", origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight

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
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS not allowed from this origin' });
  }
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
// Run locally
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
} else {
  connectDB().catch(err => {
    console.error("❌ MongoDB connection failed on Vercel:", err);
  });
}

// ---------------------
// Export for Vercel
// ---------------------
module.exports = app;
