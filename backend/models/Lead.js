const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    required: true,
    enum: ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'],
    default: 'website'
  },
  status: {
    type: String,
    required: true,
    enum: ['new', 'contacted', 'qualified', 'lost', 'won'],
    default: 'new'
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  leadValue: {
    type: Number,
    min: 0,
    default: 0
  },
  lastActivityAt: {
    type: Date
  },
  isQualified: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
leadSchema.index({ user: 1, email: 1 });
leadSchema.index({ user: 1, status: 1 });
leadSchema.index({ user: 1, source: 1 });
leadSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);

