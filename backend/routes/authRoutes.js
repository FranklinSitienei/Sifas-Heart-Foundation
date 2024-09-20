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
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("http://localhost:3000"); // Redirect to your client-side URL
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

    const token = generateToken(user);
    await handleSignupAchievements(user.id);

    const registrationMessage = "Thank you for registering! Welcome to our platform.";
    await Notification.create({ userId: user.id, message: registrationMessage, type: "signup" });

    res.json({ token });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Time Spent Achievement Route
router.post("/time_spent", authMiddleware, async (req, res) => {
  const { timeSpentInMinutes } = req.body; // Expecting time spent in minutes

  if (typeof timeSpentInMinutes !== 'number' || timeSpentInMinutes < 0) {
    return res.status(400).json({ msg: "Invalid time spent value" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    
    await handleTimeSpentAchievements(user.id, timeSpentInMinutes); // Pass the time spent
    res.json({ msg: "Time spent achievement processed" });
  } catch (err) {
    res.status(500).send("Server error");
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
      .populate("achievements")

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
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

// Password Recovery Route
router.post('/recover', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ msg: 'Email is required' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'No user found with that email' });
        }

        // Generate a password reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour

        await user.save();

        // Send the reset email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

        await transporter.sendMail({
            to: user.email,
            from: 'no-reply@yourapp.com',
            subject: 'Password Reset Request',
            html: `
                <p>You requested a password reset</p>
                <p>Click <a href="${resetUrl}">here</a> to reset your password. This link will expire in 1 hour.</p>
            `,
        });

        res.json({ msg: 'Password reset link sent to your email' });

    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Password Reset Route
router.post('/password-reset', async (req, res) => {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || password !== confirmPassword) {
        return res.status(400).json({ msg: 'Invalid token or passwords do not match' });
    }

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ msg: 'Password reset token is invalid or has expired' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        res.json({ msg: 'Password has been successfully reset' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
