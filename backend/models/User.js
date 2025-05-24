const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    earnedAt: { 
        type: Date, 
        default: Date.now 
    }
});

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  name: { // Optional: useful for display in frontend
    type: String,
    get: function () {
      return `${this.firstName} ${this.lastName}`;
    }
  },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  profilePicture: { type: String, default: '' },
  mobileNumber: { type: String },
  donations: [{
    amount: Number,
    date: Date,
    description: String
  }],
  donationCount: { type: Number, default: 0 },
  totalDonated: { type: Number, default: 0 },

  achievements: [AchievementSchema],
  googleId: { type: String },
  appleId: { type: String },

  commentsPosted: { type: Number, default: 0 },
  loginCount: { type: Number, default: 0 },
  lastLoginDate: { type: Date },
  date: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deleteReason: { type: String, enum: ['TwoAccounts', 'NeedsUpgrade', 'Temporary', 'Other'], default: 'Temporary' },
  otherDeleteReason: { type: String, default: '' },
  deactivationDate: { type: Date },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  timeSpent: { type: Number, default: 0 },
  dailyVisits: { type: Number, default: 0 },
  chatAchievements: { type: Number, default: 0 },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
