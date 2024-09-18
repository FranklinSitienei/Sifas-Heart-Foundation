const mongoose = require('mongoose');
const User = require('./User');

const MonthlyStatsSchema = new mongoose.Schema({
    year: Number,
    month: Number,
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
});

const LeaderboardSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rank: {
        type: Number,
        required: true,
    },
    monthlyStats: {
        type: [MonthlyStatsSchema],
        default: [],
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
});

// Update stats for a user based on the current time zone
LeaderboardSchema.statics.updateMonthlyStats = async function (userId, year, month) {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    const leaderboard = await this.findOne({ user: userId });

    if (!leaderboard) {
        throw new Error('Leaderboard entry not found');
    }

    // Find or create monthly stats for the current year/month
    let stats = leaderboard.monthlyStats.find(
        (stat) => stat.year === year && stat.month === month
    );

    if (!stats) {
        stats = { year, month, loginCount: 0, donationCount: 0, totalDonated: 0 };
        leaderboard.monthlyStats.push(stats);
    }

    // Update stats with the latest values
    stats.loginCount = user.loginCount;
    stats.donationCount = user.donationCount;
    stats.totalDonated = user.totalDonated;

    // Calculate and update user rank
    leaderboard.rank = await this.calculateUserRank(userId);

    leaderboard.lastUpdated = Date.now();
    await leaderboard.save();
};

// Define the rank calculation logic (Placeholder logic)
LeaderboardSchema.statics.calculateUserRank = async function (userId) {
    // Example: Just returning a static rank for now
    return 1;
};

const Leaderboard = mongoose.model('Leaderboard', LeaderboardSchema);

module.exports = Leaderboard;
