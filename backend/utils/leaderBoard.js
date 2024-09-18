const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
const moment = require('moment-timezone');  // Using moment-timezone to handle time zones

// Helper function to get the user's local time and determine the month
const getUserLocalMonth = (timezone) => {
    return moment.tz(new Date(), timezone).month() + 1; // Returns month number (1-12)
};

const getUserLocalYear = (timezone) => {
    return moment.tz(new Date(), timezone).year(); // Returns the current year in user's time zone
};

const updateUserLogin = async (userId, timezone) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.loginCount += 1;
    user.lastLoginDate = new Date();
    await user.save();

    const currentMonth = getUserLocalMonth(timezone);
    const currentYear = getUserLocalYear(timezone);

    await Leaderboard.updateMonthlyStats(userId, currentYear, currentMonth);  // Update stats based on local time
};

const updateUserDonation = async (userId, amount, timezone) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.donationCount += 1;
    user.totalDonated += amount;
    await user.save();

    const currentMonth = getUserLocalMonth(timezone);
    const currentYear = getUserLocalYear(timezone);

    await Leaderboard.updateMonthlyStats(userId, currentYear, currentMonth);  // Update stats based on local time
};

module.exports = { updateUserLogin, updateUserDonation };
