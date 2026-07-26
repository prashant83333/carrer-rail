const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

// @route POST /api/auth/signup
// role can be 'user' or 'recruiter'. Admin accounts are seeded, not self-registered.
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, companyName, college } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const finalRole = role === 'recruiter' ? 'recruiter' : 'user';

    if (finalRole === 'recruiter' && !companyName) {
      return res.status(400).json({ message: 'Company name is required for recruiter signup' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: finalRole,
      companyName: companyName || '',
      college: college || ''
    });

    const token = signToken(user._id);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/auth/login  (works for user, recruiter, admin)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    if (user.isBlocked) return res.status(403).json({ message: 'Account blocked. Contact admin.' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    const token = signToken(user._id);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

// @route PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const allowedFields = [
      'name', 'phone', 'college', 'branch', 'graduationYear', 'skills', 'bio',
      'companyName', 'companyWebsite', 'designation'
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) req.user[field] = req.body[field];
    });
    await req.user.save();
    res.json({ user: req.user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
