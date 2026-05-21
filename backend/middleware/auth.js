const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('./error');

// Verify Bearer token, attach req.user
exports.protect = asyncHandler(async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = auth.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user) return res.status(401).json({ message: 'User not found' });

  req.user = user;
  next();
});

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Admin access required' });
};
