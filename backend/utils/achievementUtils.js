const mongoose = require('mongoose');
const User = require('../models/User');

// Helper function to check if an achievement already exists
const hasAchievement = (user, title) => {
    return user.achievements.some(achievement => achievement.title === title);
};

// Function to add an achievement to the user
const addAchievement = async (userId, title, description, icon) => {
    const user = await User.findById(new mongoose.Types.ObjectId(userId));
    if (!user) return;

    if (!hasAchievement(user, title)) {
        user.achievements.push({ title, description, icon });
        await user.save();
    }
};

// Function to add a badge to the user
const addBadge = async (userId, title, icon) => {
    const user = await User.findById(new mongoose.Types.ObjectId(userId));
    if (!user) return;

    if (!user.badges.some(badge => badge.title === title)) {
        user.badges.push({ title, icon });
        await user.save();
    }
};

// Achievements when a user logs in
const handleLoginAchievements = async (userId) => {
    const user = await User.findById(new mongoose.Types.ObjectId(userId));
    if (!user) return;

    // Increment login count
    user.loginCount += 1;
    await user.save();

    // Award first login achievement
    if (user.loginCount === 1) {
        await addAchievement(userId, 'First Login', 'Logged in for the first time', '/images/log-in1.png');
    }

    // Award regular login achievement
    if (user.loginCount === 5) {
        await addAchievement(userId, 'Regular Login', 'Logged in 5 times', '/images/log-in2.png');
        await addBadge(userId, 'Regular Visitor', '/images/log-in2.png');
    }

    // Award daily login achievement
    const lastLoginDate = user.lastLoginDate;
    const currentLoginDate = new Date();
    user.lastLoginDate = currentLoginDate;
    await user.save();

    // Achievements when a user logs in (continued)
    if (lastLoginDate && (currentLoginDate - lastLoginDate < 24 * 60 * 60 * 1000)) {
        await addAchievement(userId, 'Daily Login', 'Logged in daily', '/images/schedule.png');
    }
};

// Achievements when a user donates
const handleDonationAchievements = async (userId, amount) => {
    const user = await User.findById(new mongoose.Types.ObjectId(userId));
    if (!user) return;

    // Increment donation count and total donated amount
    user.donationCount += 1;
    user.totalDonated += amount;
    await user.save();

    // Award first donation achievement
    if (user.donationCount === 1) {
        await addAchievement(userId, 'First Donation', 'Completed your first donation', '/images/first-donation.png');
    }

    // Award regular donation achievement
    if (user.donationCount === 10) {
        await addAchievement(userId, 'Regular Donor', 'Donated 10 times', '/images/regular-donor.png');
        await addBadge(userId, 'Consistent Donor', '/images/consistently-donate.png');
    }

    // Award badges based on total donations
    if (user.totalDonated >= 100 && !user.badges.some(b => b.title === 'Century Club')) {
        await addBadge(userId, 'Century Club', '/images/century-club.png');
    }

    if (user.totalDonated >= 500 && !user.badges.some(b => b.title === 'Half a Grand')) {
        await addBadge(userId, 'Half a Grand', '/images/half-a-grand.png');
    }
};

// Achievements when a user stays on the site for over an hour
const handleTimeSpentAchievements = async (userId, timeSpentInMinutes) => {
    const user = await User.findById(new mongoose.Types.ObjectId(userId));
    if (!user) return;

    if (timeSpentInMinutes >= 60) {
        await addAchievement(userId, 'Site Enthusiast', 'Spent over an hour on the site in a day', '/images/site-enthusiast.png');
    }
};

// Achievements for daily visits
const handleDailyVisitAchievements = async (userId) => {
    const user = await User.findById(new mongoose.Types.ObjectId(userId));
    if (!user) return;

    await addAchievement(userId, 'Daily Visitor', 'Visited the app daily', '/images/daily-visitor.png');
};

// Achievements for profile update
const handleProfileUpdateAchievements = async (userId) => {
    const user = await User.findById(new mongoose.Types.ObjectId(userId));
    if (!user) return;

    await addAchievement(userId, 'Profile Updated', 'Successfully updated your profile', '/images/profile-updated.png');
};

// Achievements for chatting with the admin
const handleAdminChatAchievements = async (userId) => {
    const user = await User.findById(new mongoose.Types.ObjectId(userId));
    if (!user) return;

    await addAchievement(userId, 'Engaged User', 'Chatted with the admin', '/images/engaged-user.png');
};

// New function for user signup achievements
const handleSignupAchievements = async (userId) => {
    await addAchievement(userId, 'Welcome Aboard', 'Signed up as a new user', '/images/welcome.png');
};

module.exports = {
    handleLoginAchievements,
    handleDonationAchievements,
    handleTimeSpentAchievements,
    handleDailyVisitAchievements,
    handleProfileUpdateAchievements,
    handleAdminChatAchievements,
    handleSignupAchievements, // Added new function
};
