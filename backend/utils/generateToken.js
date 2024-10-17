const jwt = require('jsonwebtoken');

exports.generateToken = (req) => {
    // Determine if the user is an admin based on the presence of req.admin
    const isAdmin = !!req.admin;
    
    // Select the appropriate secret based on the user type
    const secret = isAdmin ? process.env.ADMIN_JWT_SECRET : process.env.JWT_SECRET;

    // Construct the payload based on the user type
    const payload = isAdmin 
        ? { admin: { id: req.admin._id } } // Attach admin details
        : { user: { id: req.user._id } };   // Attach user details

    // Sign the token with the appropriate secret and expiration time
    return jwt.sign(payload, secret, { expiresIn: '30d' });
};
