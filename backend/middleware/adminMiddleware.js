const jwt = require('jsonwebtoken');

exports.adminMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Ensure token is extracted correctly

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET); // Use a different secret for admin tokens
        req.admin = decoded.admin; // Attach admin info to req.admin
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
