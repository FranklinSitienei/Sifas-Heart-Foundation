const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminMiddleware = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin || admin.isDeactivated) {
      return res.status(403).json({ message: "Not authorized or deactivated" });
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { adminMiddleware };
