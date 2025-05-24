const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const DonationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  donorName: {
    type: String,
    required: true,
  },
  donorEmail: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  paymentMethod: {
    type: String,
    enum: ['Visa', 'Mastercard', 'PayPal', 'MPesa', 'MobileMoney'],
    required: true,
  },
  phoneNumber: String,
  cardNumber: String,
  expiryDate: String,
  cvv: String,
  paypalEmail: String,
  mpesaReceiptNumber: String,
  transactionId: {
    type: String,
    default: function () {
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
});

module.exports = mongoose.model('Donation', DonationSchema);