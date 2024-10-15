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

  useEffect(() => {
    const adminToken = localStorage.getItem("admin");
    const config = { headers: { Authorization: `Bearer ${adminToken}` } };

    // Fetch donations overview
    axios
      .get("http://localhost:5000/api/donations/overview", config)
      .then((res) => setDonationOverview(res.data))
      .catch((error) =>
        console.error("Error fetching donation overview:", error)
      );

    // Fetch monthly donations for the bar chart
    axios
      .get("http://localhost:5000/api/donations/monthly", config)
      .then((res) => setMonthlyDonations(res.data))
      .catch((error) =>
        console.error("Error fetching monthly donations:", error)
      );

    // Fetch total users
    axios
      .get("http://localhost:5000/api/auth/total", config)
      .then((res) => setUsers(res.data.total))
      .catch((error) => console.error("Error fetching total users:", error));

    // Fetch recent transactions
    axios
      .get("http://localhost:5000/api/donations/recent", config)
      .then((res) => setRecentTransactions(res.data))
      .catch((error) =>
        console.error("Error fetching recent transactions:", error)
      );

    // Fetch user chats/questions
    axios
      .get("http://localhost:5000/api/chat/admin/all", config)
      .then((res) => {
        console.log("User Chats Response:", res.data);
        setUserChats(res.data);
      })
      .catch((error) => console.error("Error fetching user chats:", error));

    // Fetch payment method breakdown for pie chart
    axios
      .get("http://localhost:5000/api/donations/payment-methods", config)
      .then((res) => setPaymentMethods(res.data))
      .catch((error) =>
        console.error("Error fetching payment methods:", error)
      );
  }, []);

  // Preparing data for the bar chart
  const barChartData = {
    labels: monthlyDonations.map((data) => `Month ${data._id.month}`),
    datasets: [
      {
        label: "Donations per Month (USD)",
        data: monthlyDonations.map((data) => data.total),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Preparing data for the pie chart
  const pieChartData = {
    labels: paymentMethods.map((data) => data._id),
    datasets: [
      {
        label: "Payment Method Breakdown",
        data: paymentMethods.map((data) => data.total),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  return (
    <div className="dashboard-container">
      {/* Top Section: Donation Overview and Monthly Donations */}
      <div className="top-section">
        {/* Donation Overview */}
        <div className="donation-overview">
          {/* <div className="overview-card">
            <h3>Today's Donations</h3>
            <p>{donationOverview.totalToday || 0}</p>
          </div> */}
          <div className="overview-card">
            <h3>This Month's Donations</h3>
            <p>${donationOverview.totalThisMonth || 0}</p>
          </div>
          <div className="overview-card">
            <h3>This Year's Donations</h3>
            <p>${donationOverview.totalThisYear || 0}</p>
          </div>
        </div>

        {/* Monthly Donations Bar Chart */}
        <div className="monthly-donations-chart">
          <h3>Monthly Donations ({new Date().getFullYear()})</h3>
          <Bar data={barChartData} />
        </div>
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
              <tr key={transaction._id}>
                <td>
                  {transaction.userId?.firstName} {transaction.userId?.lastName}
                </td>
                <td>${transaction.amount}</td>
                <td>{transaction.paymentMethod}</td>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>{transaction.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Section: User Chats and Payment Methods Pie Chart */}
      <div className="bottom-section">
        {/* User Chats */}
        <div className="user-chats-section">
          <h3>User Chats and Questions</h3>
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
                        {chat.messages[chat.messages.length - 1]?.text ||
                          "No messages yet."}
                      </p>
                      <small>
                        {new Date(chat.lastActive).toLocaleString()}
                      </small>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <p>No user chats available.</p>
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
