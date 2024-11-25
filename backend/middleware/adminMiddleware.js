const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Assumes "Bearer <token>"

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET); // Use admin secret for verification
        
        
        const admin = await Admin.findById(decoded.admin.id); // Ensure this matches your payload structure
        
        if (!admin) {
            return res.status(403).json({ message: "Not authorized" });
        }

        req.admin = admin; // Attach admin to the request
        next();
    } catch (error) {
        console.error("Admin middleware error:", error);
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({ message: "Invalid token format" });
        }
        return res.status(500).json({ message: "Failed to authenticate token" });
    }
};

module.exports = { adminMiddleware };
