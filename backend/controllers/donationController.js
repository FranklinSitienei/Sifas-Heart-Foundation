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
