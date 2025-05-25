const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Donation = require('../models/Donation');

// All Donations from Users
exports.getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find().populate('userId', 'name email');
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Admin Profile
exports.getProfile = async (req, res) => {
    res.json(req.admin); // Already attached by middleware
};

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const updates = req.body;
        const updated = await Admin.findByIdAndUpdate(req.admin._id, updates, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update profile', error: err.message });
    }
};

// Upload Avatar
exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file || !req.file.path) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        req.admin.profilePicture = req.file.path;
        await req.admin.save();
        res.json({ message: 'Avatar uploaded successfully', profilePicture: req.file.path });
    } catch (err) {
        res.status(500).json({ message: 'Avatar upload failed', error: err.message });
    }
};


// Update Notifications
exports.updateNotifications = async (req, res) => {
    try {
        req.admin.notificationPrefs = req.body;
        await req.admin.save();
        res.json({ message: 'Notification preferences updated' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update notifications', error: err.message });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const valid = await bcrypt.compare(currentPassword, req.admin.password);
        if (!valid) return res.status(400).json({ message: 'Incorrect current password' });

        req.admin.password = await bcrypt.hash(newPassword, 10);
        await req.admin.save();
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Password update failed', error: err.message });
    }
};

// Enable or disable 2FA (toggle)
exports.toggleTwoFactor = async (req, res) => {
    try {
        req.admin.twoFactorEnabled = !req.admin.twoFactorEnabled;
        await req.admin.save();
        res.json({ message: `2FA ${req.admin.twoFactorEnabled ? 'enabled' : 'disabled'}` });
    } catch (err) {
        res.status(500).json({ message: '2FA update failed', error: err.message });
    }
};

// Deactivate Account
exports.deactivateAccount = async (req, res) => {
    try {
        req.admin.isDeactivated = true;
        await req.admin.save();
        res.json({ message: 'Admin account deactivated' });
    } catch (err) {
        res.status(500).json({ message: 'Account deactivation failed', error: err.message });
    }
};
