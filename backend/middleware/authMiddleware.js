const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Ensure token is extracted correctly

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify and decode the JWT
        req.user = decoded.user; // Attach user info to req.user
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
