const nodemailer = require('nodemailer');
const generatePayslip = require('./payslipTemplate');

async function sendDonationPayslip(donation) {
  // Configure the email transport using your SMTP settings
  const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services like 'SendGrid', 'Mailgun', etc.
    auth: {
      user: 'sitieneifranklin@gmail.com',
      pass: 'sitienei2023',
    },
  });

  // Generate the payslip HTML
  const payslipHtml = generatePayslip(donation);

  // Configure the email options
  const mailOptions = {
    from: '"Our Organization"  <no-reply@organization.com>',
    to: donation.email,
    subject: 'Your Donation Receipt',
    html: payslipHtml,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log('Payslip sent successfully');
  } catch (error) {
    console.error('Error sending payslip:', error);
  }
}

module.exports = sendDonationPayslip;
