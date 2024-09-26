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
  googleId: {
    type: String,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['admin', 'secretary'],
    default: 'admin',
  },
});

module.exports = mongoose.model('Admin', adminSchema);
