const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.adminMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized access' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    const admin = await Admin.findById(decoded.user.id); // Make sure the token payload has the correct key

    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    req.user = admin; // Set the admin as the user in the request
    next();
  } catch (err) {
    console.error(err); // Log error for debugging
    return res.status(401).json({ message: 'Unauthorized access' });
  }
};
