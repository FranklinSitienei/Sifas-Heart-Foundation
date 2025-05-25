import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { DollarSign } from 'lucide-react';

const Donation = () => {
  const { user, addAchievement, addNotification } = useAuth();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const savedUser = localStorage.getItem('user');
  const token = savedUser ? JSON.parse(savedUser).token : null;

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  ];

  const paymentMethods = [
    { id: 'visa', name: 'Visa', icon: '💳' },
    { id: 'mastercard', name: 'Mastercard', icon: '💳' },
    { id: 'paypal', name: 'PayPal', icon: '🅿️' },
    { id: 'mpesa', name: 'M-Pesa', icon: '📱' },
  ];

  const handleDonate = async () => {
    if (!amount || !paymentMethod || !donorName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {

      let endpoint = '';
      let body: any = {
        amount,
        donorName,
        donorEmail,
        currency,
      };

      if (paymentMethod === 'mpesa') {
        endpoint = 'http://localhost:5000/api/donations/mpesa';
        body.phoneNumber = phoneNumber;
      } else if (paymentMethod === 'paypal') {
        endpoint = 'http://localhost:5000/api/donations/paypal';
        body.paypalEmail = paypalEmail;
      } else if (paymentMethod === 'visa' || paymentMethod === 'mastercard') {
        endpoint = 'http://localhost:5000/api/donations/card';
        body.cardNumber = cardNumber;
        body.expiryDate = expiryDate;
        body.cvv = cvv;
      } else {
        throw new Error("Unsupported payment method");
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Donation failed');
      const result = await res.json();

      addNotification({
        type: 'donation',
        title: 'Donation Confirmed',
        message: `Your donation of ${amount} ${currency} was successful.`,
      });

      addAchievement({
        title: 'Generous Donor',
        description: `Thank you for your ${amount} ${currency} donation!`,
        icon: '💝',
      });

      toast({
        title: "Donation Successful",
        description: `Thank you, ${donorName}! Your donation of ${amount} ${currency} has been processed.`,
      });

      setAmount('');
      setPaymentMethod('');
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setPaypalEmail('');
      setPhoneNumber('');
    } catch (err) {
      toast({
        title: "Payment Failed",
        description: "Please check your details or try another method.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentFields = () => {
    switch (paymentMethod) {
      case 'visa':
      case 'mastercard':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 'paypal':
        return (
          <div>
            <Label htmlFor="paypalEmail">PayPal Email</Label>
            <Input
              id="paypalEmail"
              type="email"
              placeholder="your@email.com"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
            />
          </div>
        );
      case 'mpesa':
        return (
          <div>
            <Label htmlFor="phoneNumber">M-Pesa Phone Number</Label>
            <Input
              id="phoneNumber"
              placeholder="e.g. 0712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Make a Donation
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Your generosity helps us provide essential aid to those in need
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Donation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Donor Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="donorName">Full Name</Label>
                <Input
                  id="donorName"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="donorEmail">Email</Label>
                <Input
                  id="donorEmail"
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Amount and Currency */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 100, 500].map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(quickAmount.toString())}
                  >
                    {currencies.find(c => c.code === currency)?.symbol}{quickAmount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <Label>Payment Method</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {paymentMethods.map((method) => (
                  <Button
                    key={method.id}
                    variant={paymentMethod === method.id ? "default" : "outline"}
                    className="h-16 flex flex-col items-center justify-center"
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <span className="text-2xl mb-1">{method.icon}</span>
                    <span className="text-sm">{method.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Payment Method Specific Fields */}
            {paymentMethod && (
              <div className="pt-4 border-t">
                {renderPaymentFields()}
              </div>
            )}

            {/* Donate Button */}
            <Button
              onClick={handleDonate}
              disabled={isProcessing}
              className="w-full h-12 text-lg"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Donate ${amount ? currencies.find(c => c.code === currency)?.symbol + amount : ''}`
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Impact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Your Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">$25 Can Provide</h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Clean water for a family for one week</li>
                  <li>• Basic medical supplies for 5 people</li>
                  <li>• School supplies for 3 children</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">$50 Can Provide</h3>
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <li>• Emergency food supplies for a family</li>
                  <li>• Shelter materials for displaced families</li>
                  <li>• Educational support for 10 children</li>
                </ul>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">$100 Can Provide</h3>
                <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                  <li>• Comprehensive healthcare for 20 people</li>
                  <li>• Community water well maintenance</li>
                  <li>• Skills training for 5 adults</li>
                </ul>
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                100% of your donation goes directly to our programs. Administrative costs are covered by separate funding.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Donation;
