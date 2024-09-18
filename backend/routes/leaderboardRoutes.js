const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/Leaderboard');
const moment = require('moment-timezone');

// Fetch Monthly Leaderboard Data
router.get('/monthly', async (req, res) => {
    try {
        const timezone = req.query.timezone || 'UTC';
        const currentYear = moment().tz(timezone).year();
        const currentMonth = moment().tz(timezone).month() + 1; // Months are 1-based for clarity

        const leaderboard = await Leaderboard.find({
            'monthlyStats.year': currentYear,
            'monthlyStats.month': currentMonth,
        })
            .populate('user')
            .sort({ rank: 1 });

        res.json(leaderboard);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
