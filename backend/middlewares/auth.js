const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check for Authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Authorization token missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.status(401).json({ msg: 'Token is invalid or expired' });
  }
};
