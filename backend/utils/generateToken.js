const jwt = require('jsonwebtoken');

exports.generateToken = (user, isAdmin = false) => {
    const secret = isAdmin ? process.env.ADMIN_JWT_SECRET : process.env.JWT_SECRET;
    const payload = isAdmin ? { user: { id: user._id, role: user.role } } : { user: { id: user._id } };
    return jwt.sign(payload, secret, { expiresIn: '30d' });
};
