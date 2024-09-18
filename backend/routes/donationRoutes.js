const express = require('express');
const { makeDonation, handleMpesaSuccess } = require('../controllers/donationController');
const sendDonationPayslip = require('../utils/sendEmail');

const router = express.Router();

// Ensure both routes have valid callback functions
router.post('/donate', makeDonation);
// router.post('/mpesa/success', handleMpesaSuccess);

router.post('/send-payslip', async (req, res) => {
  try {
    await sendDonationPayslip(req.body);
    res.status(200).json({ message: 'Payslip sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send payslip' });
  }
});

module.exports = router;
