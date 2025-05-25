const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donorName: String,
  donorEmail: String,
  amount: { type: Number, required: true },
  currency: { type: String, default: 'KES' },
  paymentMethod: { type: String, enum: ['MPesa', 'Visa', 'Mastercard', 'PayPal'], required: true },
  transactionId: String,
  receiptNumber: String,
  status: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Canceled'], default: 'Pending' },
  phoneNumber: String,
  paypalEmail: String,
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
