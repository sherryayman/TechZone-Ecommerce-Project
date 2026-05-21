const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

// Helper: bail out early if validation failed
const checkValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
};

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  ],
  asyncHandler(async (req, res) => {
    if (!checkValidation(req, res)) return;

    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    res.status(201).json({ user, token: generateToken(user._id) });
  })
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password required'),
  ],
  asyncHandler(async (req, res) => {
    if (!checkValidation(req, res)) return;

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({ user, token: generateToken(user._id) });
  })
);

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/profile
// SECURITY: changing the password requires currentPassword.
// Otherwise an attacker who steals a token (e.g. via XSS) could lock the user out.
router.put(
  '/profile',
  protect,
  asyncHandler(async (req, res) => {
    const { name, email, password, currentPassword } = req.body;

    // Reload with password field included so we can verify current password
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password required to change password' });
      }
      const ok = await user.matchPassword(currentPassword);
      if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });
      if (password.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 chars' });
      }
      user.password = password;
    }

    if (name) user.name = name;
    if (email && email !== user.email) {
      const taken = await User.findOne({ email });
      if (taken) return res.status(409).json({ message: 'Email already in use' });
      user.email = email;
    }

    const updated = await user.save();
    res.json({ user: updated, token: generateToken(updated._id) });
  })
);

module.exports = router;
