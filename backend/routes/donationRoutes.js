const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { handleStkPush, handleMpesaSuccess } = require('../controllers/StkController');
const { authMiddleware } = require('../middlewares/auth');

// M-Pesa
router.post('/mpesa', authMiddleware, handleStkPush);
router.post('/mpesa/success', handleMpesaSuccess); // Public callback

// Visa/Mastercard (via Flutterwave)
router.post('/card', authMiddleware, donationController.handleCardDonation);

// PayPal
router.post('/paypal', authMiddleware, donationController.handlePayPalDonation);

router.get('/verify/:transactionId', authMiddleware, donationController.verifyDonation);

module.exports = router;
