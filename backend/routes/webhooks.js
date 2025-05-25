const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

router.post('/paypal', webhookController.handlePaypalWebhook);
router.post('/flutterwave', webhookController.handleFlutterwaveWebhook);
router.post('/simulate/flutterwave', (req, res) => {
    const fakePayload = {
      data: {
        tx_ref: req.body.tx_ref,
        status: 'successful'
      }
    };
    require('../controllers/webhookController').handleFlutterwaveWebhook({ body: fakePayload }, res);
  });
  

module.exports = router;
