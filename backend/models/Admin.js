const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  profilePicture: {
    type: String,
  },
  role: {
    type: String,
    enum: ['secretary', 'admin'],
    default: 'secretary',
  },
  googleId: {
    type: String, // To handle Google OAuth
  },
  isOnline: {
    type: Boolean,
    default: false, // To track whether admin is online
  },
});

module.exports = mongoose.model('Admin', adminSchema);
