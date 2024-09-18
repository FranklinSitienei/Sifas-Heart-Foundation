const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const DonationSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['Visa', 'Mastercard', 'PayPal', 'MPesa', 'Flutterwave'],
        required: true,
    },
    transactionId: {
        type: String,
        default: function() {
            return uuidv4();
        },
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    mpesaReceiptNumber: {
        type: String,
    },
});

module.exports = mongoose.model('Donation', DonationSchema);
