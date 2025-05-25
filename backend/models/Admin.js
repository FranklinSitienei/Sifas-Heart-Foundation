const mongoose = require('mongoose');

const notificationPrefsSchema = new mongoose.Schema({
  emailNotifications: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: true },
  donationAlerts: { type: Boolean, default: true },
  newUserAlerts: { type: Boolean, default: false },
  reportAlerts: { type: Boolean, default: true },
});

const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['message', 'donation', 'report'], default: 'message' },
  title: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  bio: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  password: { type: String }, // Optional if using OAuth
  googleId: { type: String, default: null },
  notificationPrefs: notificationPrefsSchema,
  notifications: [notificationSchema],
  twoFactorEnabled: { type: Boolean, default: false },
  isDeactivated: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date }

}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
