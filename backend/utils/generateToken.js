const jwt = require('jsonwebtoken');

exports.generateToken = (user, isAdmin = false) => {
    const secret = isAdmin ? process.env.ADMIN_JWT_SECRET : process.env.JWT_SECRET;
    return jwt.sign({ user: { id: user._id } }, secret, { expiresIn: '30d' });
};
