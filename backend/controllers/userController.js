const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Donation = require('../models/Donation');

// Get all donations
exports.getUserDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Signup (local)
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login (local)
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// OAuth signup/login
exports.oauthLogin = async (req, res) => {
  const { provider, email, name, oauthId, profilePicture } = req.body;
  try {
    let user = await User.findOne({ oauthId, oauthProvider: provider });

    if (!user) {
      user = await User.create({
        name,
        email,
        profilePicture,
        oauthId,
        oauthProvider: provider,
      });
    }

    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    const donations = await Donation.find({ user: userId });

    res.json({
      totalDonations: donations.length,
      totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
      commentsPosted: user.commentsPosted || 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile stats' });
  }
};

// Edit profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload Profile Picture
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    req.user.profilePicture = req.file.path;
    await req.user.save();
    res.json({ message: 'Avatar uploaded successfully', profilePicture: req.file.path });
  } catch (err) {
    res.status(500).json({ message: 'Avatar upload failed', error: err.message });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
