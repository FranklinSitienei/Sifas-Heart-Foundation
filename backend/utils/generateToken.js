const jwt = require('jsonwebtoken');

exports.generateToken = (user, admin, isAdmin = false) => {
    const secret = isAdmin ? process.env.ADMIN_JWT_SECRET : process.env.JWT_SECRET;

    const payload = isAdmin 
        ? { admin: { id: admin._id } } // Attach admin details
        : { user: { id: user._id } };   // Attach user details

    return jwt.sign(payload, secret, { expiresIn: '30d' });
};
