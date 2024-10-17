const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const multer = require("multer");
const Admin = require("../models/Admin");
const { generateToken } = require("../utils/generateToken");
const { adminMiddleware } = require("../middleware/adminMiddleware");

const router = express.Router();

// Set up multer for profile picture uploads
const upload = multer({ storage: multer.memoryStorage() });

// Admin Google Authentication Route
router.get("/google", passport.authenticate('google-admin', { scope: ["profile", "email"] }));

// Callback after Google login for admin
router.get(
  "/google/callback",
  passport.authenticate('google-admin', { session: false }),
  async (req, res) => {
    const token = generateToken(null, req.admin, true); // Updated to pass admin
    await Admin.findOneAndUpdate({ email: req.admin.email }, { isOnline: true });
    
    // Use the referring request's base URL to avoid hardcoding
    const redirectUrl = `${req.protocol}://${req.get('host')}/admin?token=${token}`;
    res.redirect(redirectUrl);
  }
);

// Admin Manual Signup
router.post("/signup", upload.single("profilePicture"), async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  if (!firstName || !lastName || !email || !password || password !== confirmPassword) {
    return res.status(400).json({ msg: "Please fill in all fields correctly" });
  }

  try {
    let admin = await Admin.findOne({ email });

    if (admin) {
      return res.status(400).json({ msg: "Admin with this email already exists. Please log in or use a different email." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const profilePicture = req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}` : null;

    admin = new Admin({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profilePicture,
    });

    await admin.save();
    const token = generateToken(null, admin, true); // Updated to pass admin
    res.json({ token });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Admin Manual Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const token = generateToken(null, admin, true); // Updated to pass admin
    await Admin.findByIdAndUpdate(admin._id, { isOnline: true });

    res.json({ token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).send("Server error");
  }
});

// Admin Logout
router.get("/logout", adminMiddleware, async (req, res) => {
  try {
    await Admin.findByIdAndUpdate(req.admin.id, { isOnline: false });
    res.json({ msg: "Admin logged out successfully" });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Fetch Admin Profile
router.get('/profile', adminMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password'); // Using req.admin from middleware

    if (!admin) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    res.json(admin);
  } catch (err) {
    console.error(err); // Log error for debugging
    res.status(500).send("Server error");
  }
});

// Fetch all admins (publicly accessible)
router.get("/admins", async (req, res) => {
  try {
    const admins = await Admin.find().select("firstName lastName role isOnline profilePicture");
    res.json(admins);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Update Profile
router.put("/update_profile", upload.single("profilePicture"), adminMiddleware, async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  const adminId = req.admin.id; // Assuming req.admin contains the admin ID after auth

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ msg: "Please fill in all fields correctly." });
  }

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ msg: "Admin not found." });

    // Update fields
    admin.firstName = firstName;
    admin.lastName = lastName;
    admin.email = email;

    // Handle password change
    if (password && password === confirmPassword) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    // Handle profile picture upload
    if (req.file) {
      admin.profilePicture = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    await admin.save();
    res.json(admin);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
