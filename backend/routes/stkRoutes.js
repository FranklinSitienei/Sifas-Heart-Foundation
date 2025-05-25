const express = require('express');
const router = express.Router();
const stkController = require('../controllers/stkController');
const { authMiddleware } = require('../middlewares/auth');

router.post('/stkpush', authMiddleware, stkController.initiateStkPush);
router.post('/register', stkController.registerUrls);
router.post('/confirmation', stkController.handleConfirmation);
router.post('/validation', stkController.handleValidation);

module.exports = router;
