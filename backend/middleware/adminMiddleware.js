const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.adminMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized access: No token provided' });
  }

  try {
    console.log('Received token:', token); // Debugging token
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

    if (!decoded || !decoded.user || !decoded.user.id) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    const admin = await Admin.findById(decoded.user.id);

    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    req.user = admin; // Attach the admin to the request
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message); // Log detailed error
    return res.status(401).json({ message: 'Unauthorized access: Invalid token' });
  }
};
