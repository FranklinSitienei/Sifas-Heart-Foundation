const crypto = require('crypto');

exports.generateTransactionId = () => {
    return crypto.randomBytes(16).toString('hex');
};
