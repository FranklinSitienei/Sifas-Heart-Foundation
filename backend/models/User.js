const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: String,
  description: String,
  icon: String,
  earnedAt: { type: Date, default: Date.now }
});

const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['message', 'donation', 'report'], default: 'message' },
  title: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String }, // Optional if using OAuth only
  profilePicture: { type: String, default: '' },
  isAdmin: { type: Boolean, default: false },
  achievements: [achievementSchema],
  notifications: [notificationSchema],
  totalDonations: { type: Number, default: 0 },
  donationCount: { type: Number, default: 0 },
  oauthProvider: { type: String, enum: ['google', 'apple', null], default: null },
  oauthId: { type: String, default: null },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date },
  receipts: [{
    amount: Number,
    currency: String,
    paymentMethod: String,
    transactionId: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
