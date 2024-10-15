const axios = require('axios');
const { timestamp } = require('../utils/timeStamp');
const Donation = require('../models/Donation');
const User = require('../models/User');
require('dotenv').config();

// Function to get the access token for M-Pesa
const getAccessToken = async () => {
  const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_ACCESS_TOKEN_URL } = process.env;

  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  const response = await axios.get(MPESA_ACCESS_TOKEN_URL, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  return response.data.access_token;
};

// Handle STK Push for M-Pesa donations
const handleStkPush = async (req, res) => {
  const { amount, phoneNumber } = req.body;

  if (!amount) {
    return res.status(400).json({ message: 'Amount is required.' });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(400).json({ message: 'User ID not found in request.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let mobileNumber = user.mobileNumber || phoneNumber;
    if (!mobileNumber) {
      return res.status(400).json({ message: 'User mobile number is required.' });
    }

    const formattedPhone = mobileNumber.startsWith('254') ? mobileNumber : mobileNumber.replace(/^0/, '254');
    const BUSINESS_SHORT_CODE = process.env.BUSINESS_SHORT_CODE;
    const ACCOUNT_NUMBER = process.env.ACCOUNT_NUMBER;

    const PASSWORD = Buffer.from(
      `${BUSINESS_SHORT_CODE}${process.env.MPESA_PASS_KEY}${timestamp}`
    ).toString('base64');

    const payload = {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Password: PASSWORD,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: BUSINESS_SHORT_CODE,
      PhoneNumber: formattedPhone,
      CallBackURL: `${process.env.BASE_URL}/mpesa/success`, // Callback route for M-Pesa response
      AccountReference: ACCOUNT_NUMBER,
      TransactionDesc: 'Donation Payment',
    };

    const accessToken = await getAccessToken();

    const response = await axios.post(
      process.env.MPESA_STK_PUSH_URL,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const donation = new Donation({
      userId: userId,
      amount: amount,
      paymentMethod: 'MPesa',
      transactionId: response.data.CheckoutRequestID,
      status: 'Pending',
    });

    await donation.save();

    res.status(201).json({ message: 'M-Pesa STK Push initiated', data: response.data });
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        message: 'M-Pesa STK Push failed',
        error: error.response.data,
      });
    } else if (error.request) {
      return res.status(500).json({ message: 'No response from M-Pesa' });
    } else {
      return res.status(500).json({ message: 'M-Pesa STK Push failed', error: error.message });
    }
  }
};

// Handle M-Pesa success callback
const handleMpesaSuccess = async (req, res) => {
  try {
    const { Body } = req.body;
    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;

    if (ResultCode === 0) {
      const donation = await Donation.findOne({ transactionId: CheckoutRequestID });

      if (!donation) {
        return res.status(404).json({ message: 'Donation not found' });
      }

      const metadata = CallbackMetadata.Item;

      let mReceipt = null, mPhoneNumber = null, mAmount = null;

      metadata.forEach((entry) => {
        switch (entry.Name) {
          case 'MpesaReceiptNumber':
            mReceipt = entry.Value;
            break;
          case 'PhoneNumber':
            mPhoneNumber = entry.Value;
            break;
          case 'Amount':
            mAmount = entry.Value;
            break;
          default:
            break;
        }
      });

      // Update donation details
      donation.status = 'Completed';
      donation.receiptNumber = mReceipt;
      donation.phoneNumber = mPhoneNumber;
      donation.amount = mAmount;

      await donation.save();

      return res.status(200).json({ message: 'Donation successful', donation });
    } else if (ResultCode === 1032) {
      const donation = await Donation.findOne({ transactionId: CheckoutRequestID });

      if (donation) {
        donation.status = 'Canceled';
        await donation.save();
        return res.status(200).json({ message: 'Donation canceled by user' });
      }

      return res.status(404).json({ message: 'Donation not found' });
    } else {
      return res.status(400).json({ message: `Payment failed: ${ResultDesc}` });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error handling M-Pesa success callback', error: error.message });
  }
};

module.exports = { handleStkPush, handleMpesaSuccess };
