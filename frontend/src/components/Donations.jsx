import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Donation.css';
import { FaCcVisa, FaCcMastercard, FaMobileAlt } from 'react-icons/fa';

const Donations = () => {
  const [donation, setDonation] = useState({
    amount: '',
    fullName: '',
    email: '',
    paymentMethod: 'Visa',
    phoneNumber: '', // Manages the phone number
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    currency: 'USD',
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState(''); // Message to display for confirmation status
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthError(true);
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const userData = await response.json();
          setDonation((prevDonation) => ({
            ...prevDonation,
            fullName: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            phoneNumber: userData.mobileNumber || '', // Autofill phone number if available
          }));
          setIsLoggedIn(true);
        } else {
          setAuthError(true);
        }
      } catch (error) {
        setAuthError(true);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDonation({ ...donation, [name]: value });
  };

  const handlePaymentMethodChange = (e) => {
    const value = e.target.value;
    setDonation({ ...donation, paymentMethod: value });
  };

  const handleCurrencyChange = (e) => {
    const value = e.target.value;
    setDonation({ ...donation, currency: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
  
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to be logged in to make a donation');
      navigate('/login');
      return;
    }
  
    try {
      // Ensure phone number is provided
      if (!donation.phoneNumber) {
        alert('Phone number is required.');
        setIsProcessing(false);
        return;
      }

      // Update the mobile number in the user's profile
      const updateResponse = await fetch('http://localhost:5000/api/auth/update_mobile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mobileNumber: donation.phoneNumber }),
      });
  
      if (!updateResponse.ok) {
        const errorResponse = await updateResponse.json();
        alert(`Failed to update mobile number: ${errorResponse.msg}`);
        setIsProcessing(false);
        return;
      }

      let response;
      let payload;
  
      if (donation.paymentMethod === 'M-Pesa') {
        // Initiating M-Pesa STK push
        payload = {
          amount: donation.amount,
          phoneNumber: donation.phoneNumber, // Use the phone number provided
        };
        response = await fetch('http://localhost:5000/api/lipa/stk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          setConfirmationMessage('WAITING FOR YOUR CONFIRMATION...');
          const { data } = await response.json();

          // Polling to check status after STK push
          const checkDonationStatus = async () => {
            const statusResponse = await fetch(`http://localhost:5000/api/donations/status/${data.CheckoutRequestID}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            const statusData = await statusResponse.json();
            
            if (statusData.donationStatus === 'Completed') {
              setConfirmationMessage(`Thank you for your donation of ${donation.currency} ${donation.amount}`);
            } else if (statusData.donationStatus === 'Canceled') {
              setConfirmationMessage('Donation canceled by user.');
            }
          };

          // Poll every 5 seconds to check the status
          const intervalId = setInterval(checkDonationStatus, 5000);

          // Stop polling once payment is confirmed or canceled
          if (confirmationMessage.includes('Thank you') || confirmationMessage.includes('canceled')) {
            clearInterval(intervalId);
          }
        } else {
          setConfirmationMessage('Payment initiation failed.');
        }
      } else {
        // Other payment methods (Visa, Mastercard)
        payload = {
          amount: donation.amount,
          fullName: donation.fullName,
          email: donation.email,
          cardNumber: donation.cardNumber,
          expiryDate: donation.expiryDate,
          cvv: donation.cvv,
          paymentMethod: donation.paymentMethod,
        };
        response = await fetch('http://localhost:5000/api/donations/donate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          setConfirmationMessage(`Thank you for your donation of ${donation.currency} ${donation.amount}`);
        } else {
          const errorResponse = await response.json();
          alert(`Donation failed: ${errorResponse.msg}`);
        }
      }

      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
      alert('Donation failed');
    }
  };

  if (authError) {
    return <p>Error: Authentication failed. Please log in again.</p>;
  }
  
  return (
    <div className="donations-container">
      <h2 className="title">Make a Donation</h2>
      <form className="donations-form" onSubmit={handleSubmit}>
        <div className="amount">
          <select
            name="currency"
            value={donation.currency}
            onChange={handleCurrencyChange}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="KES">KES</option>
          </select>
          <input
            type="text"
            name="amount"
            placeholder={`Amount (${donation.currency})`}
            value={donation.amount}
            onChange={handleInputChange}
            required
          />
        </div>
        <input
          className="input-group"
          type="text"
          name="fullName"
          placeholder="Your Full Name"
          value={donation.fullName}
          onChange={handleInputChange}
          required
        />
        <input
          className="input-group"
          type="email"
          name="email"
          placeholder="Your Email"
          value={donation.email}
          onChange={handleInputChange}
          required
        />
        <div className="options">
          <select
            name="paymentMethod"
            value={donation.paymentMethod}
            onChange={handlePaymentMethodChange}
          >
            <option value="Visa">Visa</option>
            <option value="Mastercard">Mastercard</option>
            <option value="M-Pesa">M-Pesa</option>
          </select>
          <div className="payment-icons">
            {donation.paymentMethod === 'Visa' && <FaCcVisa className="payment-icon" />}
            {donation.paymentMethod === 'Mastercard' && <FaCcMastercard className="payment-icon" />}
            {donation.paymentMethod === 'M-Pesa' && <FaMobileAlt className="payment-icon" />}
          </div>
        </div>

        {/* Conditional rendering based on payment method */}
        {donation.paymentMethod === 'Visa' || donation.paymentMethod === 'Mastercard' ? (
          <div className="payment-details">
            <input
              className="input-group"
              type="text"
              name="cardNumber"
              placeholder="Card Number"
              value={donation.cardNumber}
              onChange={handleInputChange}
              required
            />
            <input
              className="input-group"
              type="text"
              name="expiryDate"
              placeholder="MM/YY Expiry Date"
              value={donation.expiryDate}
              onChange={handleInputChange}
              required
            />
            <input
              className="input-group"
              type="text"
              name="cvv"
              placeholder="CVV"
              value={donation.cvv}
              onChange={handleInputChange}
              required
            />
          </div>
        ) : (
          <input
            className="input-group"
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={donation.phoneNumber}
            onChange={handleInputChange}
            required
          />
        )}

        <button type="submit" className="submit-button" disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Donate Now'}
        </button>
      </form>
      {/* Confirmation message displayed after initiating the STK push */}
      {confirmationMessage && (
        <p className="confirmation-message">{confirmationMessage}</p>
      )}

      <p className="thank-you-message">Your support makes a difference. Thank you!</p>
    </div>
  );
};

export default Donations;
