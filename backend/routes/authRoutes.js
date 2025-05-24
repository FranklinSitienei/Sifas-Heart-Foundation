const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");
const { generateToken } = require("../utils/generateToken");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { updateUserLogin } = require("../utils/leaderBoard");
const {
  handleLoginAchievements,
  handleSignupAchievements,
  handleProfileUpdateAchievements,
  handleTimeSpentAchievements,
  handleDailyVisitAchievements,
} = require("../utils/achievementUtils");
const { authMiddleware } = require("../middleware/authMiddleware");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Notification = require("../models/Notification");
const { notifyLogin, notifySignup, notifyAchievement } = require('../controllers/notificationController');

const router = express.Router();

// User Google Authentication Route
router.get("/google", passport.authenticate('google-user', { scope: ["profile", "email"] }));

// Callback after Google login for user
router.get(
  "/google/callback",
  passport.authenticate('google-user', { session: false }),
  async (req, res) => {
    try {
      const token = generateToken(req.user);
      await handleSignupAchievements(req.user.id);
      await notifySignup(req.user.id);  // Notify user on successful signup
      await notifyAchievement(req.user.id);

      // Set token in the response header instead of query param
      res.setHeader('Authorization', `Bearer ${token}`);

    } catch (err) {
      res.status(500).send("Server error during Google callback");
    }
  }
);

// Success and Failure Routes
router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      error: false,
      message: "Successfully Logged In",
      user: req.user,
    });
  } else {
    res.status(403).json({ error: true, message: "Not Authorized" });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    error: true,
    message: "Log in failure",
  });
});

// Logout Route
router.get("/logout", authMiddleware, async (req, res) => {
  try {
    // Perform the logout process
    req.logout();

    // Redirect to your client-side URL or a login page after successful logout
    res.redirect("http://localhost:3000");
  } catch (err) {
    console.error("Error during logout:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// User Signup Route
router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword, mobileNumber } = req.body;

  if (!firstName || !lastName || !email || !password || password !== confirmPassword) {
    return res.status(400).json({ msg: "Please fill in all fields correctly" });
  }

  try {
    // Check if the user with the given email already exists
    let user = await User.findOne({ email });

    if (user) {
      // Redirect to the existing user's profile instead of sending an error
      return res.status(200).json({ redirect: `/account` }); // Change `/account` to your actual user profile route if different
    }

    // Proceed with user creation if the email is not in use
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      mobileNumber,
    });

    await user.save();
    await notifySignup(user.id);  // Notify user on successful signup

    const token = generateToken(user);
    await handleSignupAchievements(user.id);
    await notifyAchievement(user.id);

    const registrationMessage = "Thank you for registering! Welcome to our platform.";
    await Notification.create({ userId: user.id, message: registrationMessage, type: "signup" });

    res.json({ token });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Time Spent Achievement Route
router.post('/time_spent', authMiddleware, async (req, res) => {
  const { timeSpentInMinutes } = req.body;

  if (typeof timeSpentInMinutes !== 'number' || timeSpentInMinutes < 0) {
    return res.status(400).json({ msg: 'Invalid time spent value' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) throw new Error('User not found.');

    await handleTimeSpentAchievements(user._id, timeSpentInMinutes);
    await notifyAchievement(user._id, `Time Spent: ${timeSpentInMinutes} minutes`);
    res.json({ msg: 'Time spent achievement processed.' });
  } catch (err) {
    console.error('Error processing time spent:', err.message);
    res.status(500).send('Server error');
  }
});

// Daily Visit Achievement on Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Please fill in all fields" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const token = generateToken(user);
    await handleLoginAchievements(user.id);
    await notifyLogin(user.id);  // Notify user on successful login
    await notifyAchievement(user.id);

    // Check and award daily visit achievement
    await handleDailyVisitAchievements(user.id);

    const loginMessage = "You have successfully logged in.";
    await Notification.create({ userId: user.id, message: loginMessage, type: "login" });

    res.json({ token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).send("Server error");
  }
});

// Profile Update Route
router.put("/update_profile", upload.single("profilePicture"), authMiddleware, async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ msg: "User not found" });

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;

    if (password && password === confirmPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    } else if (password && password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    if (req.file) {
      const base64Image = req.file.buffer.toString("base64");
      user.profilePicture = `data:${req.file.mimetype};base64,${base64Image}`;
    }

    await user.save();
    await handleProfileUpdateAchievements(user.id);
    await notifyAchievement(user.id);
    res.json({ msg: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Fetch User Profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .lean();

    if (!user) return res.status(404).json({ msg: "User not found" });

    // Return profile data with additional computed fields
    const achievements = user.achievements || [];

    const stats = {
      totalDonations: user.donations?.length || 0,
      totalAmount: user.totalDonated || 0,
      commentsPosted: user.commentsPosted || 0,
      achievementsEarned: achievements.length,
    };

    res.json({ user, achievements, stats });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Other Routes (Achievements, Daily Visits, etc.)
router.get("/achievements", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("achievements badges");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.post("/time_spent", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    await handleTimeSpentAchievements(user.id);
    await notifyAchievement(user.id);
    res.json({ msg: "Time spent achievement processed" });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.post("/daily_visit", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    await handleDailyVisitAchievements(user.id);
    await notifyAchievement(user.id);
    res.json({ msg: "Daily visit achievement processed" });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Upload Profile Picture Route
router.post('/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Convert image file to base64
    const base64Image = req.file.buffer.toString('base64');
    user.profilePicture = `data:${req.file.mimetype};base64,${base64Image}`;

    await user.save();
    res.json({ msg: 'Profile picture updated successfully' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Update Mobile Number Route
router.put('/update_mobile', authMiddleware, async (req, res) => {
  const { mobileNumber } = req.body;
  const userId = req.user.id;

  if (!mobileNumber) {
    return res.status(400).json({ msg: 'Mobile number is required' });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.mobileNumber = mobileNumber;
    await user.save();

    res.json({ msg: 'Mobile number updated successfully', user });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Apple Authentication Routes
// router.get('/apple', passport.authenticate('apple'));

// router.post('/apple/callback',
//     passport.authenticate('apple', { session: false }),
//     (req, res) => {
//         const token = generateToken(req.user);
//         res.json({ token });  // Return the token directly in the response
//     }
// );

router.post('/password-setup', authMiddleware, async (req, res) => {
  const { password, confirmPassword } = req.body;

  if (!password || password !== confirmPassword) {
    return res.status(400).json({ msg: 'Passwords do not match' });
  }

  try {
    const user = await User.findById(req.user.id);  // Use user from auth middleware

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    res.json({ msg: 'Password setup successful' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Delete Account Route
router.delete('/delete_account', authMiddleware, async (req, res) => {
  const { password, email, reason, otherReason } = req.body;

  if (!password || !email) {
    return res.status(400).json({ msg: 'Password and email are required' });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if email matches
    if (user.email !== email) {
      return res.status(400).json({ msg: 'Email does not match' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid password' });
    }

    // Handle different reasons for account deletion
    if (reason === 'Other' && !otherReason) {
      return res.status(400).json({ msg: 'Please provide a reason for deletion' });
    }

    if (reason === 'Temporary') {
      user.isDeleted = true;
      user.deleteReason = reason;
      user.otherDeleteReason = otherReason || '';
      user.deactivationDate = Date.now();
      await user.save();
      res.json({ msg: 'Account has been temporarily deactivated. You can recover it within 30 days.' });
      return;
    }

    // Permanently delete the account
    await User.findByIdAndDelete(user._id);
    res.json({ msg: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Password recovery route
router.post('/recover', async (req, res) => {
  const { email } = req.body;

  try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ msg: 'User not found' });

      // Generate a unique reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour
      await user.save();

      // Send reset email
      const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
          },
      });

      const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
      const message = `
          <h1>Password Reset Request</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
      `;

      await transporter.sendMail({
          to: email,
          subject: 'Password Reset Request',
          html: message,
      });

      res.status(200).json({ msg: 'Password reset link sent to your email.' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Error sending reset email' });
  }
});

// Reset password route
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
      return res.status(400).json({ msg: 'Passwords do not match' });
  }

  try {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const user = await User.findOne({
          resetPasswordToken: hashedToken,
          resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) return res.status(400).json({ msg: 'Invalid or expired token' });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      res.status(200).json({ msg: 'Password reset successful' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
  }
});

// Total users
router.get('/total', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.json({ totalUsers });
  } catch (error) {
    console.error('Error fetching total users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
