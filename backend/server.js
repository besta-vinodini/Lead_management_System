// server.js (replace your existing file)
const express = require('express');
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
// Allowed origins (env or defaults)
// ---------------------
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : [
      'https://lead-management-system-beta-ten.vercel.app',
      'http://localhost:3000'
    ];

// ---------------------
// Very early: explicit CORS + preflight handler
// (placed BEFORE rate limiter and routes so preflight won't be blocked)
// ---------------------
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    // required CORS response headers
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin'); // helpful for caches
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type,X-Requested-With,Accept,Origin');
  }

  // respond to preflight immediately
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

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
// Error handling (include CORS headers on error responses)
// ---------------------
app.use((err, req, res, next) => {
  // ensure CORS headers are present even when responding with error
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS not allowed from this origin' });
  }
  console.error('Error:', err && (err.stack || err.message || err));
  res.status(500).json({ error: 'Internal server error' });
});

// ---------------------
// 404 handler
// ---------------------
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ---------------------
// Local run vs Vercel
// ---------------------
if (!process.env.VERCEL) {
  (async () => {
    try {
      await connectDB();
      if (process.env.NODE_ENV === 'development') {
        await seedDatabase();
      }
      const PORT = config.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`🌍 Environment: ${config.NODE_ENV}`);
      });
    } catch (err) {
      console.error('❌ Failed to start server:', err);
      process.exit(1);
    }
  })();
} else {
  // In Vercel serverless: ensure DB connects
  connectDB().catch(err => {
    console.error('❌ MongoDB connection failed on Vercel:', err);
  });
}

module.exports = app;
