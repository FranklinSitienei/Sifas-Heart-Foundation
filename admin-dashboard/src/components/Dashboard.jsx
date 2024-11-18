import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import io from "socket.io-client";
import "chart.js/auto";
import "../css/Dashboard.css";

const Dashboard = () => {
  const [donationOverview, setDonationOverview] = useState({});
  const [monthlyDonations, setMonthlyDonations] = useState([]);
  const [users, setUsers] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [userChats, setUserChats] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasUnreadChats, setHasUnreadChats] = useState(false);

  const navigate = useNavigate();
  const socket = io("https://sifas-heart-foundation-1.onrender.com");
  const adminToken = localStorage.getItem("admin");

  console.log(localStorage.getItem("admin"));


  useEffect(() => {
    
    if (!adminToken) {
      setError("Admin token not found. Please log in.");
      setLoading(false);
      return;
    }

    const config = { headers: { Authorization: `Bearer ${adminToken}` } };

    const fetchDashboardData = async () => {
      try {
        const [
          overviewResponse,
          monthlyResponse,
          usersResponse,
          transactionsResponse,
          chatsResponse,
          paymentMethodsResponse,
        ] = await Promise.all([
          axios.get("https://sifas-heart-foundation-1.onrender.com/api/donations/overview", config),
          axios.get("https://sifas-heart-foundation-1.onrender.com/api/donations/monthly", config),
          axios.get("https://sifas-heart-foundation-1.onrender.com/api/auth/total", config),
          axios.get("https://sifas-heart-foundation-1.onrender.com/api/donations/recent", config),
          axios.get("https://sifas-heart-foundation-1.onrender.com/api/chat/admin/all", config),
          axios.get("https://sifas-heart-foundation-1.onrender.com/api/donations/payment-methods", config),
        ]);

        setDonationOverview(overviewResponse.data);
        setMonthlyDonations(monthlyResponse.data);
        setUsers(usersResponse.data.total);
        setRecentTransactions(transactionsResponse.data);
        setUserChats(chatsResponse.data);
        setPaymentMethods(paymentMethodsResponse.data);
        setLoading(false);

        const unreadChats = chatsResponse.data.filter((chat) => !chat.isRead);
        setHasUnreadChats(unreadChats.length > 0);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to fetch dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Socket.IO real-time updates
    socket.on("newChat", (newChat) => {
      setUserChats((prevChats) => [newChat, ...prevChats]);
      setHasUnreadChats(true);
    });

    socket.on("updateDonationOverview", (data) => {
      setDonationOverview(data);
    });

    socket.on("newTransaction", (transaction) => {
      setRecentTransactions((prevTransactions) => [transaction, ...prevTransactions]);
    });

    return () => {
      socket.disconnect(); // Cleanup socket connection
    };
  }, [socket]);

  const handleChatClick = (chatId) => {
    navigate(`/chat/details/${chatId}`);
  };

  const markAsRead = async (chatId) => {
    try {
      await axios.post(
        `https://sifas-heart-foundation-1.onrender.com/api/chat/admin/${chatId}/read`, {
          headers: {
              'Authorization': `Bearer ${adminToken}`,
          },
      }
      );
      setUserChats((prevChats) => prevChats.filter((chat) => chat._id !== chatId));
    } catch (err) {
      console.error("Error marking chat as read:", err);
    }
  };

  // Month names for labeling the bar chart
  const monthNames = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
  ];

  // Preparing data for the bar chart with month names and Ksh formatting
  const barChartData = {
    labels: monthlyDonations.map((data) => monthNames[data._id - 1] || `Month ${data._id}`),
    datasets: [
      {
        label: "Total Donations (Ksh)",
        data: monthlyDonations.map((data) => data.total),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Configure the y-axis to display Ksh
  const barChartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return 'Ksh ' + value;
          }
        }
      },
      x: {
        ticks: {
          autoSkip: false
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Ksh ${context.parsed.y}`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Mapping payment methods to specific colors
  const paymentMethodColors = {
    Visa: "#FF6384", Mastercard: "#36A2EB", Mpesa: "#FFCE56", PayPal: "#4BC0C0", Flutterwave: "#9966FF",
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
        <Bar data={barChartData} options={barChartOptions} height={400} />
      </div>

      {/* Middle Section: Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div className="recent-transactions">
          <h2>Recent Donation Transactions</h2>
          <table className="donation-table">
            <thead>
              <tr>
                <th>User Full Name</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Transaction ID</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.transactionId}>
                  <td>{transaction.userId ? `${transaction.userId.firstName} ${transaction.userId.lastName}` : 'N/A'}</td>
                  <td>{transaction.userId ? transaction.userId.email : 'N/A'}</td>
                  <td>{formatAmount(transaction.amount)}</td>
                  <td>{transaction.paymentMethod}</td>
                  <td>{transaction.transactionId}</td>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bottom Section: User Chats and Payment Methods Pie Chart */}
      <div
        className={`bottom-section ${hasUnreadChats ? 'with-chats' : 'no-chats'
          }`}
      >
        {hasUnreadChats && (
          <div className="user-chats-section">
            <h3>Latest User Chats</h3>
            <ul className="chat-list">
              {userChats.map((chat) => (
                <li
                  key={chat._id}
                  className="chat-item"
                  onClick={() => handleChatClick(chat._id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="chat-header">
                    <img
                      src={chat.userId?.profilePicture || '/default-profile.png'}
                      alt={`${chat.userId?.firstName || 'Admin'} ${chat.userId?.lastName || ''}`}
                      className="chat-user-picture"
                    />
                    <div>
                      <strong>{chat.userId?.firstName || 'Admin'} {chat.userId?.lastName || ''}</strong>
                      <p>{chat.messages[chat.messages.length - 1]?.text || "No messages yet."}</p>
                      <button
                        onClick={() => markAsRead(chat._id)}
                        className="mark-as-read"
                      >
                        Mark as Read
                      </button>
                      <small>{new Date(chat.lastActive).toLocaleString()}</small>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Payment Methods Pie Chart */}
      {paymentMethods.length > 0 && (
        <div className="payment-methods">
          <h3>Donation Payment Method Breakdown</h3>
          <Pie data={pieChartData} height={200} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
