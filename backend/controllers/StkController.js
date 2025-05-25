const axios = require('axios');
const Donation = require('../models/Donation');
const User = require('../models/User');
const { getCurrentTimestamp } = require('../utils/timeStamp');

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const PASSKEY = process.env.MPESA_PASS_KEY;
const SHORTCODE = process.env.BUSINESS_SHORT_CODE;
const CALLBACK_BASE = process.env.CALLBACK_BASE_URL;

// Step 1: Get M-Pesa access token
const getAccessToken = async () => {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const res = await axios.get(process.env.MPESA_ACCESS_TOKEN_URL, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return res.data.access_token;
};

// Step 2: STK Push Request
const initiateStkPush = async (req, res) => {
  try {
    const { amount, phoneNumber } = req.body;
    const userId = req.user?.id;

    if (!amount || !phoneNumber) return res.status(400).json({ message: 'Missing fields' });

    const timestamp = getCurrentTimestamp();
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

    const accessToken = await getAccessToken();

    const response = await axios.post(
      process.env.MPESA_STK_PUSH_URL,
      {
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: `${CALLBACK_BASE}/api/mpesa/callback`,
        AccountReference: "SifaDonation",
        TransactionDesc: "Charity Donation"
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    await Donation.create({
      userId,
      phoneNumber,
      amount,
      transactionId: response.data.CheckoutRequestID,
      status: 'Pending',
      paymentMethod: 'MPesa'
    });

    res.status(200).json({ message: 'STK Push sent', data: response.data });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: 'STK push failed', error: err.response?.data || err.message });
  }
};

// Step 3: Register URLs
const registerUrls = async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const response = await axios.post(
      process.env.MPESA_REGISTER_URL,
      {
        ShortCode: SHORTCODE,
        ResponseType: "Completed",
        ConfirmationURL: `${CALLBACK_BASE}/api/mpesa/confirmation`,
        ValidationURL: `${CALLBACK_BASE}/api/mpesa/validation`
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    res.status(200).json({ message: 'URLs registered', data: response.data });
  } catch (error) {
    res.status(500).json({ message: 'Failed to register URLs', error: error.message });
  }
};

// Step 4: Confirmation callback
const handleConfirmation = async (req, res) => {
  const data = req.body;
  const { TransID, TransAmount, MSISDN, FirstName, LastName } = data;

  try {
    const donation = await Donation.findOneAndUpdate(
      { transactionId: TransID },
      {
        status: 'Completed',
        phoneNumber: MSISDN,
        donorName: `${FirstName} ${LastName}`,
        amount: TransAmount,
        receiptNumber: TransID
      },
      { new: true }
    );

    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Success'
    });
  } catch (err) {
    console.error('Confirmation error', err);
    res.status(500).json({
      ResultCode: 1,
      ResultDesc: 'Error occurred'
    });
  }
};

// Step 5: Validation (optional, just always accept)
const handleValidation = (req, res) => {
  res.status(200).json({
    ResultCode: "0",
    ResultDesc: "Accepted"
  });
};

module.exports = {
  initiateStkPush,
  registerUrls,
  handleConfirmation,
  handleValidation
};
