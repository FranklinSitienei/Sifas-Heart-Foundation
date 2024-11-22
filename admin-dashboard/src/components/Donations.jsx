// src/components/Donation.jsx
import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import '../css/Donation.css';

const Donation = () => {
    const [donations, setDonations] = useState([]);
    const [monthlyData, setMonthlyData] = useState({ labels: [], data: [] });
    const [paymentBreakdown, setPaymentBreakdown] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    const token = localStorage.getItem("admin"); // Fetch the admin token

    useEffect(() => {
        if (!token) {
            setError("Admin token not found. Please log in.");
            setLoading(false);
            return;
        }

        const fetchDonationsData = async () => {
            try {
                // Fetch monthly donations data for the bar chart
                const monthlyResponse = await axios.get('https://sifas-heart-foundation.onrender.com/api/donations/monthly', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                prepareMonthlyData(monthlyResponse.data);

                // Fetch recent transactions for the transaction table
                const transactionResponse = await axios.get('https://sifas-heart-foundation.onrender.com/api/donations/recent', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDonations(transactionResponse.data);

                // Fetch payment method breakdown
                const paymentBreakdownResponse = await axios.get('https://sifas-heart-foundation.onrender.com/api/donations/payment-methods', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPaymentBreakdown(paymentBreakdownResponse.data);

                setLoading(false); // Data fetched successfully
            } catch (error) {
                console.error('Error fetching donation data:', error);
                setError("Failed to fetch donation data. Please try again later.");
                setLoading(false);
            }
        };

        fetchDonationsData();
    }, [token]);

    const prepareMonthlyData = (data) => {
        const labels = [];
        const amounts = [];
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Initialize all months with 0 to ensure consistent bar chart
        const donationsByMonth = Array(12).fill(0);

        data.forEach((entry) => {
            const monthNumber = entry._id; // Assuming _id is the month number (1-12)
            if (monthNumber >= 1 && monthNumber <= 12) {
                donationsByMonth[monthNumber - 1] = entry.total;
            }
        });

        // Populate labels and amounts
        donationsByMonth.forEach((amount, index) => {
            labels.push(monthNames[index]);
            amounts.push(amount);
        });

        setMonthlyData({ labels, data: amounts });
    };

    // Preparing data for the bar chart with month names and Ksh formatting
    const barChartData = {
        labels: monthlyData.labels,
        datasets: [
            {
                label: "Total Donations (Ksh)",
                data: monthlyData.data,
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
                    callback: function(value) {
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
                    label: function(context) {
                        return `Ksh ${context.parsed.y}`;
                    }
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    // Preparing data for the pie chart (Visa, Mastercard, M-Pesa)
    const pieChartData = {
        labels: paymentBreakdown.map((data) => {
            if (data.paymentMethod.toLowerCase() === "visa") return "Visa";
            if (data.paymentMethod.toLowerCase() === "mastercard") return "Mastercard";
            if (data.paymentMethod.toLowerCase() === "mpesa") return "M-Pesa";
            return data.paymentMethod;
        }),
        datasets: [
            {
                label: "Payment Method Breakdown",
                data: paymentBreakdown.map((data) => data.total),
                backgroundColor: [
                    "#FF6384", // Visa - Pink
                    "#36A2EB", // Mastercard - Blue
                    "#FFCE56", // M-Pesa - Yellow
                ],
                hoverBackgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                ],
            },
        ],
    };

    if (loading) {
        return <div className="donation-container"><p>Loading...</p></div>;
    }

    if (error) {
        return <div className="donation-container"><p className="error-message">{error}</p></div>;
    }

    return (
        <div className="donation-container">
            <h1>Monthly Donations for {new Date().getFullYear()}</h1>
            <div className="chart-container">
                <Bar data={barChartData} options={barChartOptions} height={400} />
            </div>

            <h2>Recent Donation Transactions</h2>
            {donations.length === 0 ? (
                <p>No recent donations found.</p>
            ) : (
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
                        {donations.map((donation) => (
                            <tr key={donation.transactionId}>
                                <td>
                                    {donation.userId ? 
                                        `${donation.userId.firstName} ${donation.userId.lastName}` 
                                        : 'N/A'
                                    }
                                </td>
                                <td>
                                    {donation.userId ? donation.userId.email : 'N/A'}
                                </td>
                                <td>Ksh {donation.amount.toLocaleString()}</td>
                                <td>{donation.paymentMethod}</td>
                                <td>{donation.transactionId}</td>
                                <td>{new Date(donation.date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <h2>Payment Method Breakdown</h2>
            {paymentBreakdown.length === 0 ? (
                <p>No payment methods data available.</p>
            ) : (
                <div className="pie-chart-container">
                    <Pie data={pieChartData} />
                </div>
            )}
        </div>
    );

};

export default Donation;
