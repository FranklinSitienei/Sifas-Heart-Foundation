const Donation = require('../models/Donation');
const User = require('../models/User');

// PayPal Webhook
exports.handlePaypalWebhook = async (req, res) => {
  const { resource } = req.body;
  const { id: transactionId, amount } = resource;

  try {
    const donation = await Donation.findOne({ transactionId });
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    donation.status = 'Completed';
    await donation.save();

    await User.findByIdAndUpdate(donation.userId, {
      $inc: { totalDonations: donation.amount, donationCount: 1 }
    });

    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Flutterwave Webhook
exports.handleFlutterwaveWebhook = async (req, res) => {
  const payload = req.body.data;
  const txRef = payload.tx_ref;
  const status = payload.status;

  try {
    const donation = await Donation.findOne({ transactionId: txRef });
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    if (status === 'successful') {
      donation.status = 'Completed';
      await donation.save();

      await User.findByIdAndUpdate(donation.userId, {
        $inc: { totalDonations: donation.amount, donationCount: 1 }
      });
    }

    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
