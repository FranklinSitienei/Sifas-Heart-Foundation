const express = require('express');
const { handleStkPush, handleMpesaSuccess } = require('../controllers/stkController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { generateToken } = require('../middleware/generateToken');

const router = express.Router();

// STK Push Route (Ensure authMiddleware is applied)
router.post('/stk', authMiddleware, generateToken, handleStkPush);

// M-Pesa success callback route
router.post('/mpesa/success', handleMpesaSuccess);

module.exports = router;
