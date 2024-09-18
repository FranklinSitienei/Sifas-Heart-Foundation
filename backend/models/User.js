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
    date: {
        type: Date,
        default: Date.now,
    },
});

const UserSchema = new mongoose.Schema({
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
        type: String, // Base64 encoded image
        default: '',
    },
    mobileNumber: {
        type: String, // Include country code
        required: true,
    },
    donations: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Donation',
        },
    ],
    googleId: { type: String },
    appleId: { type: String },
    achievements: [AchievementSchema],
    loginCount: {
        type: Number,
        default: 0,
    },
    donationCount: {
        type: Number,
        default: 0,
    },
    totalDonated: {
        type: Number,
        default: 0,
    },
    lastLoginDate: {
        type: Date,
    },
    date: { type: Date, default: Date.now },

    isDeleted: { type: Boolean, default: false },
    deleteReason: { type: String, enum: ['TwoAccounts', 'NeedsUpgrade', 'Temporary', 'Other'], default: 'Temporary' },
    otherDeleteReason: { type: String, default: '' },
    deactivationDate: { type: Date },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
