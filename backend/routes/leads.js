const express = require('express');
const { body, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config');

const router = express.Router();

// Middleware to authenticate user
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = { userId: user._id };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Apply authentication to all routes
router.use(authenticateToken);

// Helper function to build filter query
const buildFilterQuery = (filters, userId) => {
  let query = { user: userId };

  if (filters.email) {
    if (filters.email.operator === 'equals') {
      query.email = filters.email.value;
    } else if (filters.email.operator === 'contains') {
      query.email = { $regex: filters.email.value, $options: 'i' };
    }
  }

  if (filters.company) {
    if (filters.company.operator === 'equals') {
      query.company = filters.company.value;
    } else if (filters.company.operator === 'contains') {
      query.company = { $regex: filters.company.value, $options: 'i' };
    }
  }

  if (filters.city) {
    if (filters.city.operator === 'equals') {
      query.city = filters.city.value;
    } else if (filters.city.operator === 'contains') {
      query.city = { $regex: filters.city.value, $options: 'i' };
    }
  }

  if (filters.status) {
    if (filters.status.operator === 'equals') {
      query.status = filters.status.value;
    } else if (filters.status.operator === 'in') {
      query.status = { $in: filters.status.value };
    }
  }

  if (filters.source) {
    if (filters.source.operator === 'equals') {
      query.source = filters.source.value;
    } else if (filters.source.operator === 'in') {
      query.source = { $in: filters.source.value };
    }
  }

  if (filters.score) {
    if (filters.score.operator === 'equals') {
      query.score = filters.score.value;
    } else if (filters.score.operator === 'gt') {
      query.score = { $gt: filters.score.value };
    } else if (filters.score.operator === 'lt') {
      query.score = { $lt: filters.score.value };
    } else if (filters.score.operator === 'between') {
      query.score = { 
        $gte: filters.score.value.min, 
        $lte: filters.score.value.max 
      };
    }
  }

  if (filters.lead_value) {
    if (filters.lead_value.operator === 'equals') {
      query.leadValue = filters.lead_value.value;
    } else if (filters.lead_value.operator === 'gt') {
      query.leadValue = { $gt: filters.lead_value.value };
    } else if (filters.lead_value.operator === 'lt') {
      query.leadValue = { $lt: filters.lead_value.value };
    } else if (filters.lead_value.operator === 'between') {
      query.leadValue = { 
        $gte: filters.lead_value.value.min, 
        $lte: filters.lead_value.value.max 
      };
    }
  }

  if (filters.is_qualified !== undefined) {
    query.isQualified = filters.is_qualified;
  }

  if (filters.created_at) {
    if (filters.created_at.operator === 'on') {
      const date = new Date(filters.created_at.value);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    } else if (filters.created_at.operator === 'before') {
      query.createdAt = { $lt: new Date(filters.created_at.value) };
    } else if (filters.created_at.operator === 'after') {
      query.createdAt = { $gt: new Date(filters.created_at.value) };
    } else if (filters.created_at.operator === 'between') {
      query.createdAt = { 
        $gte: new Date(filters.created_at.value.start), 
        $lte: new Date(filters.created_at.value.end) 
      };
    }
  }

  if (filters.last_activity_at) {
    if (filters.last_activity_at.operator === 'on') {
      const date = new Date(filters.last_activity_at.value);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      query.lastActivityAt = { $gte: startOfDay, $lte: endOfDay };
    } else if (filters.last_activity_at.operator === 'before') {
      query.lastActivityAt = { $lt: new Date(filters.last_activity_at.value) };
    } else if (filters.last_activity_at.operator === 'after') {
      query.lastActivityAt = { $gt: new Date(filters.last_activity_at.value) };
    } else if (filters.last_activity_at.operator === 'between') {
      query.lastActivityAt = { 
        $gte: new Date(filters.last_activity_at.value.start), 
        $lte: new Date(filters.last_activity_at.value.end) 
      };
    }
  }

  return query;
};

// GET /leads - List leads with pagination and filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // Parse filters from query parameters
    const filters = { ...req.query };
    delete filters.page;
    delete filters.limit;

    // Build filter query
    const filterQuery = buildFilterQuery(filters, req.user.userId);

    // Get total count
    const total = await Lead.countDocuments(filterQuery);

    // Get leads with pagination
    const leads = await Lead.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

    res.json({
      data: leads,
      page,
      limit,
      total,
      totalPages
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /leads/:id - Get single lead
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findOne({ _id: id, user: req.user.userId }).lean();

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /leads - Create lead
router.post('/', [
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('source').isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other']),
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'lost', 'won']),
  body('score').optional().isInt({ min: 0, max: 100 }),
  body('leadValue').optional().isNumeric(),
  body('lastActivityAt').optional().isISO8601(),
  body('isQualified').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      city,
      state,
      source,
      status = 'new',
      score = 0,
      leadValue = 0,
      lastActivityAt,
      isQualified = false
    } = req.body;

    // Check if email already exists for this user
    const existingLead = await Lead.findOne({ 
      email, 
      user: req.user.userId 
    });

    if (existingLead) {
      return res.status(400).json({ error: 'Lead with this email already exists' });
    }

    const lead = new Lead({
      firstName,
      lastName,
      email,
      phone,
      company,
      city,
      state,
      source,
      status,
      score,
      leadValue,
      lastActivityAt: lastActivityAt ? new Date(lastActivityAt) : null,
      isQualified,
      user: req.user.userId
    });

    await lead.save();

    res.status(201).json(lead);
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /leads/:id - Update lead
router.put('/:id', [
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('source').optional().isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other']),
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'lost', 'won']),
  body('score').optional().isInt({ min: 0, max: 100 }),
  body('leadValue').optional().isNumeric(),
  body('lastActivityAt').optional().isISO8601(),
  body('isQualified').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if lead exists and belongs to user
    const existingLead = await Lead.findOne({ 
      _id: id, 
      user: req.user.userId 
    });

    if (!existingLead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Check email uniqueness if email is being updated
    if (updateData.email && updateData.email !== existingLead.email) {
      const emailExists = await Lead.findOne({ 
        email: updateData.email, 
        user: req.user.userId,
        _id: { $ne: id }
      });

      if (emailExists) {
        return res.status(400).json({ error: 'Lead with this email already exists' });
      }
    }

    // Handle date conversion
    if (updateData.lastActivityAt) {
      updateData.lastActivityAt = new Date(updateData.lastActivityAt);
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: id, user: req.user.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /leads/:id - Delete lead
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findOneAndDelete({ 
      _id: id, 
      user: req.user.userId 
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;