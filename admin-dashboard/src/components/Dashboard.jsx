import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import '../css/Dashboard.css';

const Dashboard = () => {
  const [donationOverview, setDonationOverview] = useState({});
  const [monthlyDonations, setMonthlyDonations] = useState([]);
  const [users, setUsers] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [userChats, setUserChats] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    const adminToken = localStorage.getItem('admin');
    const config = { headers: { Authorization: `Bearer ${adminToken}` } };

    // Fetch donations overview
    axios.get('http://localhost:5000/api/donations/overview', config).then(res => setDonationOverview(res.data))
      .catch(error => console.error("Error fetching donation overview:", error));

    // Fetch monthly donations for the bar chart
    axios.get('http://localhost:5000/api/donations/monthly', config).then(res => setMonthlyDonations(res.data))
      .catch(error => console.error("Error fetching monthly donations:", error));

    // Fetch total users
    axios.get('http://localhost:5000/api/auth/total', config).then(res => setUsers(res.data.total))
      .catch(error => console.error("Error fetching total users:", error));

    // Fetch recent transactions
    axios.get('http://localhost:5000/api/donations/recent', config).then(res => setRecentTransactions(res.data))
      .catch(error => console.error("Error fetching recent transactions:", error));

    // Fetch user chats/questions
    axios.get('http://localhost:5000/api/chat/all', config).then(res => setUserChats(res.data))
      .catch(error => console.error("Error fetching user chats:", error));

    // Fetch payment method breakdown for pie chart
    axios.get('http://localhost:5000/api/donations/payment-methods', config).then(res => setPaymentMethods(res.data))
      .catch(error => console.error("Error fetching payment methods:", error));
  }, []);

  // Preparing data for the bar chart
  const barChartData = {
    labels: monthlyDonations.map((data) => `Month ${data._id.month}`),
    datasets: [{
      label: 'Donations per Month (USD)',
      data: monthlyDonations.map((data) => data.total),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  // Preparing data for the pie chart
  const pieChartData = {
    labels: paymentMethods.map((data) => data._id),
    datasets: [{
      label: 'Payment Method Breakdown',
      data: paymentMethods.map((data) => data.total),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
      ],
      hoverBackgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
      ]
    }]
  };

  return (
    <div className="dashboard-container">
      
      {/* Donation Overview */}
      <div className="donation-overview">
        <div className="overview-card">
          <h3>Today's Donations</h3>
          <p>${donationOverview.totalToday || 0}</p>
        </div>
        <div className="overview-card">
          <h3>This Month's Donations</h3>
          <p>${donationOverview.totalThisMonth || 0}</p>
        </div>
        <div className="overview-card">
          <h3>This Year's Donations</h3>
          <p>${donationOverview.totalThisYear || 0}</p>
        </div>
      </div>

      {/* Bar Chart for Monthly Donations */}
      <div className="chart-section">
        <h3>Monthly Donations (Current Year)</h3>
        <Bar data={barChartData} />
      </div>

      {/* Recent Transactions */}
      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        <table className="transactions-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map(transaction => (
              <tr key={transaction._id}>
                <td>{transaction.userId?.firstName} {transaction.userId?.lastName}</td>
                <td>${transaction.amount}</td>
                <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                <td>{transaction.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Methods Breakdown (Pie Chart) */}
      <div className="chart-section">
        <h3>Payment Method Breakdown</h3>
        <Pie data={pieChartData} />
      </div>

      {/* User Chats */}
      <div className="user-chats">
        <h3>User Chats and Questions</h3>
        <ul className="chat-list">
          {userChats.map(chat => (
            <li key={chat._id} className="chat-item">
              <div>
                <strong>{chat.userId?.firstName} {chat.userId?.lastName}:</strong> {chat.message}
              </div>
              <small>{new Date(chat.lastActive).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
