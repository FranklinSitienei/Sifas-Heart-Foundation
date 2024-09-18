const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    read: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        enum: [
            'login',
            'donation',
            'signup',
            'update',
            'admin_chat',
            'payslip',
            'email_recovery',
            'new_campaign',
            'achievement'
        ],
        required: true,
    },
});

module.exports = mongoose.model('Notification', NotificationSchema);
