require('dotenv').config();
const Flutterwave = require('flutterwave-node-v3');
const Mpesa = require('mpesa-node');
const Donation = require('../models/Donation');
const User = require('../models/User');
const { generateTransactionId } = require('../utils/generateTransactionId');
const { sendDonationEmail } = require('../utils/sendEmail');
const { generatePayslipTemplate } = require('../utils/payslipTemplate');
const { updateUserDonation } = require('../utils/leaderBoard');
const { handleDonationAchievements } = require('../utils/achievementUtils');
const Notification = require('../models/Notification');

const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
const mpesaApi = new Mpesa({
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    environment: 'sandbox',
    shortCode: process.env.MPESA_BUSINESS_SHORT_CODE,
    lipaNaMpesaShortCode: process.env.MPESA_BUSINESS_SHORT_CODE,
    lipaNaMpesaShortPass: process.env.MPESA_PASS_KEY,
});

exports.makeDonation = async (req, res) => {
    const { amount, paymentMethod, accountBank, accountNumber } = req.body;

    try {
        let transactionId;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const userFullName = `${user.firstName} ${user.lastName}`;
        const userEmail = user.email;
        const userMobileNumber = user.mobileNumber;

        if (paymentMethod === 'Visa' || paymentMethod === 'Mastercard') {
            const payload = {
                "account_bank": accountBank, // Flutterwave bank code
                "account_number": accountNumber,
                "amount": amount,
                "narration": `Donation by ${userFullName}`,
                "currency": "NGN", // change as needed
                "reference": generateTransactionId(), // Unique reference for this transfer
                "callback_url": `${process.env.BACKEND_URL}/api/donations/flutterwave/success`,
                "debit_currency": "NGN"
            };

            const response = await flw.Transfer.initiate(payload);
            if (response.status === 'success') {
                transactionId = response.data.id;
            } else {
                return res.status(400).json({ msg: 'Flutterwave payment failed' });
            }
        } else if (paymentMethod === 'M-Pesa') {
            const response = await mpesaApi.lipaNaMpesaOnline(
                userMobileNumber,
                amount,
                `${process.env.BACKEND_URL}/api/donations/mpesa/success`,
                `Donation-${generateTransactionId()}`
            );

            if (response.ResponseCode === '0') {
                transactionId = response.CheckoutRequestID;
            } else {
                return res.status(400).json({ msg: 'M-Pesa payment failed' });
            }
        }

        // Save donation in the database
        const donation = new Donation({
            userId: user._id,
            amount,
            paymentMethod,
            transactionId,
            userFullName,
            userEmail,
            userMobileNumber
        });

        await donation.save();
        await updateUserDonation(req.user.id, amount);
        await handleDonationAchievements(req.user.id, amount);

        // Send notification
        const donationMessage = `Thank you for your donation of $${amount}. Your transaction ID is ${transactionId}.`;
        await Notification.create({ userId: req.user.id, message: donationMessage, type: 'donation' });

        // Send payslip via email
        const payslipHtml = generatePayslipTemplate(donation);
        await sendDonationEmail(user.email, payslipHtml);

        res.json(donation);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Overview: Total donations today, this month, this year
exports.getDonationsOverview = async (req, res) => {
    try {
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);
  
      const totalToday = await Donation.aggregate([
        { $match: { createdAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
  
      const totalThisMonth = await Donation.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
  
      const totalThisYear = await Donation.aggregate([
        { $match: { createdAt: { $gte: startOfYear } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
  
      res.json({
        totalToday: totalToday[0]?.total || 0,
        totalThisMonth: totalThisMonth[0]?.total || 0,
        totalThisYear: totalThisYear[0]?.total || 0
      });
    } catch (error) {
      console.error("Error fetching donations overview:", error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
// Monthly donations for bar chart (current year)
exports.getMonthlyDonations = async (req, res) => {
  try {
      const currentYear = new Date().getFullYear();
      const monthlyDonations = await Donation.aggregate([
          {
              $match: {
                  createdAt: {
                      $gte: new Date(`${currentYear}-01-01`),
                      $lte: new Date(`${currentYear}-12-31`)
                  }
              }
          },
          {
              $group: {
                  _id: { $month: "$createdAt" },
                  total: { $sum: "$amount" }
              }
          },
          { $sort: { "_id": 1 } }
      ]);

      res.json(monthlyDonations);
  } catch (error) {
      console.error("Error fetching monthly donations:", error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

// Recent transactions
exports.getRecentTransactions = async (req, res) => {
  try {
      const recentTransactions = await Donation.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('userId', 'firstName lastName email');
      res.json(recentTransactions);
  } catch (error) {
      console.error('Error fetching recent transactions:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

// Payment method breakdown
exports.getPaymentMethodBreakdown = async (req, res) => {
  try {
      const paymentMethods = await Donation.aggregate([
          { $group: { _id: "$paymentMethod", total: { $sum: "$amount" } } }
      ]);

      res.json(paymentMethods);
  } catch (error) {
      console.error('Error fetching payment method breakdown:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

  