module.exports = function generatePayslip(donation) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f7f7f7;
          }
          .payslip-container {
            width: 600px;
            margin: 20px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            margin-bottom: 20px;
          }
          .content h2 {
            margin: 0 0 10px;
            font-size: 20px;
          }
          .content p {
            margin: 5px 0;
            font-size: 16px;
          }
          .footer {
            text-align: center;
            font-size: 14px;
            color: #888;
          }
        </style>
      </head>
      <body>
        <div class="payslip-container">
          <div class="header">
            <h1>Donation Receipt</h1>
            <p>Thank you for your generosity!</p>
          </div>
          <div class="content">
            <h2>Donation Details</h2>
            <p><strong>Donor Name:</strong> ${donation.name}</p>
            <p><strong>Email:</strong> ${donation.email}</p>
            <p><strong>Amount:</strong> $${donation.amount}</p>
            <p><strong>Payment Method:</strong> ${donation.paymentMethod}</p>
            <p><strong>Transaction ID:</strong> ${donation.transactionId}</p>
            <p><strong>Date:</strong> ${new Date(donation.date).toLocaleDateString()}</p>
          </div>
          <div class="footer">
            <p>Your contribution helps us make a difference. Thank you for your support!</p>
            <p>&copy; 2024 Our Organization</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  