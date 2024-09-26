const express = require('express');
const { makeDonation, handleMpesaSuccess, getDonationsOverview, getMonthlyDonations, getRecentTransactions, getPaymentMethodBreakdown } = require('../controllers/donationController');
const sendDonationPayslip = require('../utils/sendEmail');
const { adminMiddleware } = require("../middleware/adminMiddleware");

const router = express.Router();

router.get('/', async (req, res) => {
  try {
      const donations = await Donation.find().populate('userId', 'firstName lastName email mobileNumber');
      res.json(donations);
  } catch (error) {
      console.error('Error fetching donations:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


// Overview data: Total donations (today, month, year)
router.get('/overview', adminMiddleware, getDonationsOverview);

// Monthly donations for the bar chart
router.get('/monthly-donations', adminMiddleware, getMonthlyDonations);

// Recent transactions
router.get('/recent-transactions', adminMiddleware, getRecentTransactions);

// Ensure both routes have valid callback functions
router.post('/donate', makeDonation);

// router.post('/mpesa/success', handleMpesaSuccess);

// DonationRoutes.js
router.get('/payment-methods', adminMiddleware, getPaymentMethodBreakdown);


router.post('/send-payslip', async (req, res) => {
  try {
    await sendDonationPayslip(req.body);
    res.status(200).json({ message: 'Payslip sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send payslip' });
  }
});

module.exports = router;
