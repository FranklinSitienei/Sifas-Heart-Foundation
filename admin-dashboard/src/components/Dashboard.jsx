// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import "../css/Dashboard.css";

const Dashboard = () => {
  const [donationOverview, setDonationOverview] = useState({});
  const [monthlyDonations, setMonthlyDonations] = useState([]);
  const [users, setUsers] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [userChats, setUserChats] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const adminToken = localStorage.getItem("admin");
    if (!adminToken) {
      setError("Admin token not found. Please log in.");
      setLoading(false);
      return;
    }

    const config = { headers: { Authorization: `Bearer ${adminToken}` } };

    const fetchDashboardData = async () => {
      try {
        // Fetch all data concurrently
        const [
          overviewResponse,
          monthlyResponse,
          usersResponse,
          transactionsResponse,
          chatsResponse,
          paymentMethodsResponse,
        ] = await Promise.all([
          axios.get("http://localhost:5000/api/donations/overview", config),
          axios.get("http://localhost:5000/api/donations/monthly", config),
          axios.get("http://localhost:5000/api/auth/total", config),
          axios.get("http://localhost:5000/api/donations/recent", config),
          axios.get("http://localhost:5000/api/chat/admin/all", config),
          axios.get("http://localhost:5000/api/donations/payment-methods", config),
        ]);

        setDonationOverview(overviewResponse.data);
        setMonthlyDonations(monthlyResponse.data);
        setUsers(usersResponse.data.total);
        setRecentTransactions(transactionsResponse.data);
        setUserChats(chatsResponse.data);
        setPaymentMethods(paymentMethodsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to fetch dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Month names for labeling the bar chart
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Preparing data for the bar chart with month names
  const barChartData = {
    labels: monthlyDonations.map((data) => monthNames[data._id - 1] || `Month ${data._id}`),
    datasets: [
      {
        label: "Donations per Month (Ksh)",
        data: monthlyDonations.map((data) => data.total),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Mapping payment methods to specific colors
  const paymentMethodColors = {
    Visa: "#FF6384",
    Mastercard: "#36A2EB",
    Mpesa: "#FFCE56",
    PayPal: "#4BC0C0",
    Flutterwave: "#9966FF",
  };

  // Preparing data for the pie chart with specific colors
  const pieChartData = {
    labels: paymentMethods.map((data) => data.paymentMethod),
    datasets: [
      {
        label: "Payment Method Breakdown",
        data: paymentMethods.map((data) => data.total),
        backgroundColor: paymentMethods.map(
          (method) => paymentMethodColors[method.paymentMethod] || "#CCCCCC"
        ),
        hoverBackgroundColor: paymentMethods.map(
          (method) => paymentMethodColors[method.paymentMethod] || "#CCCCCC"
        ),
      },
    ],
  };

  // Format amount with Ksh and commas
  const formatAmount = (amount) => `Ksh ${amount.toLocaleString()}`;

  if (loading) {
    return (
      <div className="dashboard-container">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Top Section: Donation Overview */}
      <div className="top-section">
        <div className="overview-card">
          <h3>This Month's Donations</h3>
          <p>Ksh {donationOverview.totalThisMonth || 0}</p>
        </div>
        <div className="overview-card">
          <h3>This Year's Donations</h3>
          <p>Ksh {donationOverview.totalThisYear || 0}</p>
        </div>
      </div>

      {/* Monthly Donations Bar Chart */}
      <div className="monthly-donations-chart">
        <h3>Monthly Donations ({new Date().getFullYear()})</h3>
        <Bar data={barChartData} />
      </div>

      {/* Middle Section: Recent Transactions */}
      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        <table className="transactions-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((transaction) => (
              <tr key={transaction.transactionId}>
                <td>
                  {transaction.userId
                    ? `${transaction.userId.firstName} ${transaction.userId.lastName}`
                    : "N/A"}
                </td>
                <td>{formatAmount(transaction.amount)}</td>
                <td>{transaction.paymentMethod}</td>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>{transaction.status}</td>
              </tr>
            ))}
            {recentTransactions.some((donation) => !donation.userId) && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "red" }}>
                  Some donations could not be loaded due to missing user information.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Section: User Chats and Payment Methods Pie Chart */}
      <div className="bottom-section">
        {/* User Chats */}
        <div className="user-chats-section">
          <h3>Latest User/Admin Chats</h3>
          <ul className="chat-list">
            {Array.isArray(userChats) && userChats.length > 0 ? (
              userChats.map((chat) => (
                <li key={chat._id} className="chat-item">
                  <div className="chat-header">
                    <img
                      src={chat.userId?.profilePicture || '/default-profile.png'}
                      alt={`${chat.userId?.firstName || 'Unknown'} ${chat.userId?.lastName || ''}`}
                      className="chat-user-picture"
                    />
                    <div>
                      <strong>
                        {chat.userId?.firstName || 'Unknown'}{' '}
                        {chat.userId?.lastName || ''}
                      </strong>
                      <p>
                        {chat.messages[chat.messages.length - 1]?.text || "No messages yet."}
                      </p>
                      <small>{new Date(chat.lastActive).toLocaleString()}</small>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <p>No chats available.</p>
            )}
          </ul>
        </div>

        {/* Payment Methods Pie Chart */}
        <div className="pie-chart-section">
          <h3>Payment Method Breakdown</h3>
          <Pie data={pieChartData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
