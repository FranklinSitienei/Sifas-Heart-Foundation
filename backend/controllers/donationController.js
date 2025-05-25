const Donation = require('../models/Donation');
const User = require('../models/User');
const axios = require('axios');

// 🅿️ PayPal Donation
exports.handlePayPalDonation = async (req, res) => {
  const { amount, currency, paypalEmail } = req.body;
  const userId = req.user?.id;

  try {
    const donation = await Donation.create({
      userId,
      donorName: req.user.name,
      donorEmail: req.user.email,
      paypalEmail,
      amount,
      currency,
      paymentMethod: 'PayPal',
      status: 'Pending'
    });

    const response = await axios.post(`${process.env.PAYPAL_API_URL}`, {
      amount, currency, paypalEmail, transactionId: donation._id.toString()
    });

    donation.status = 'Completed';
    donation.transactionId = response.data.transactionId || donation._id;
    await donation.save();

    await User.findByIdAndUpdate(userId, {
      $inc: { totalDonations: donation.amount, donationCount: 1 }
    });

    await User.findByIdAndUpdate(userId, {
      $push: {
        receipts: {
          amount: donation.amount,
          currency: donation.currency,
          paymentMethod: donation.paymentMethod,
          transactionId: donation.transactionId
        }
      }
    });    

    res.status(201).json({ message: 'PayPal donation completed', donation });
  } catch (err) {
    res.status(500).json({ message: 'PayPal donation failed', error: err.message });
  }
};

// 💳 Visa/Mastercard via Flutterwave
exports.handleCardDonation = async (req, res) => {
  const { amount, currency, cardNumber, expiryDate, cvv } = req.body;
  const userId = req.user?.id;

  try {
    const donation = await Donation.create({
      userId,
      donorName: req.user.name,
      donorEmail: req.user.email,
      amount,
      currency,
      paymentMethod: 'Visa', // or 'Mastercard' depending on logic
      status: 'Pending'
    });

    const response = await axios.post(`${process.env.FLUTTERWAVE_API_URL}/charges?type=card`, {
      amount,
      currency,
      card_number: cardNumber,
      cvv,
      expiry: expiryDate,
      email: req.user.email,
      tx_ref: donation._id.toString(),
    }, {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      }
    });

    donation.status = 'Completed';
    donation.transactionId = response.data.data.id;
    await donation.save();

    await User.findByIdAndUpdate(userId, {
      $inc: { totalDonations: donation.amount, donationCount: 1 }
    });

    await User.findByIdAndUpdate(userId, {
      $push: {
        receipts: {
          amount: donation.amount,
          currency: donation.currency,
          paymentMethod: donation.paymentMethod,
          transactionId: donation.transactionId
        }
      }
    });    

    res.status(201).json({ message: 'Card donation completed', donation });
  } catch (err) {
    res.status(500).json({ message: 'Card donation failed', error: err.message });
  }
};

// For Verifying Donation if it was Successful
exports.verifyDonation = async (req, res) => {
  const { transactionId } = req.params;

  try {
    const donation = await Donation.findOne({ transactionId });

    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    // Optional: Query external API to reconfirm
    const isSuccessful = donation.status === 'Completed';
    res.json({ verified: isSuccessful, donation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
