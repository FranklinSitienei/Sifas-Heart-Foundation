const express = require('express');
const cors = require('cors');
const passport = require('passport');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const donationRoutes = require('./routes/donationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { authMiddleware } = require('./middleware/authMiddleware');
const passportConfig = require('./config/passport');
const emojiRoutes = require('./routes/emojiRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const lipaRoute = require('./routes/lipaRoute');
const chatRoutes = require('./routes/chatRoutes');
const path = require('path');
require('./config/passport'); 

const app = express();

// Connect Database
connectDB();

// Passport Config
passportConfig(passport);

app.use(passport.initialize());

// Middleware
app.use(cors({
    credentials: true
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/emoji', emojiRoutes);
app.use('/api/leaderboards', leaderboardRoutes);
app.use('/api/lipa', lipaRoute);
app.use('/api/chat', chatRoutes);

// Serve static files from the 'public' directory
app.use('/images', express.static(path.join(__dirname, 'public/images')));


// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

module.exports = app;
