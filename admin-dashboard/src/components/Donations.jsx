import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import '../css/Donation.css';

const Donation = () => {
    const [donations, setDonations] = useState([]);
    const [monthlyData, setMonthlyData] = useState({ labels: [], data: [] });
    const [paymentBreakdown, setPaymentBreakdown] = useState([]);

    const token = localStorage.getItem("admin"); // Fetch the admin token

    useEffect(() => {
        const fetchDonationsData = async () => {
            try {
                // Fetch monthly donations data for the bar chart
                const monthlyResponse = await axios.get('/api/donations/monthly', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                prepareMonthlyData(monthlyResponse.data);

                // Fetch recent transactions for the transaction table
                const transactionResponse = await axios.get('/api/donations/recent', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDonations(transactionResponse.data);

                // Fetch payment method breakdown
                const paymentBreakdownResponse = await axios.get('/api/donations/payment-methods', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPaymentBreakdown(paymentBreakdownResponse.data);

            } catch (error) {
                console.error('Error fetching donation data:', error);
            }
        };

        fetchDonationsData();
    }, [token]);

    const prepareMonthlyData = (data) => {
        const labels = [];
        const amounts = [];

        data.forEach((entry) => {
            const month = new Date(entry._id).toLocaleString('default', { month: 'long' });
            labels.push(month);
            amounts.push(entry.total);
        });

        setMonthlyData({ labels, data: amounts });
    };

    return (
        <div className="donation-container">
            <h1>Monthly Donations for {new Date().getFullYear()}</h1>
            <Bar
                data={{
                    labels: monthlyData.labels,
                    datasets: [{
                        label: 'Total Donations',
                        data: monthlyData.data,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    }],
                }}
                options={{
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                }}
            />

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
                    {donations.map((donation) => (
                        <tr key={donation.transactionId}>
                            <td>{donation.userId.firstName} {donation.userId.lastName}</td>
                            <td>{donation.userId.email}</td>
                            <td>{donation.amount}</td>
                            <td>{donation.paymentMethod}</td>
                            <td>{donation.transactionId}</td>
                            <td>{new Date(donation.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Payment Method Breakdown</h2>
            <ul className="payment-breakdown">
                {paymentBreakdown.map((method) => (
                    <li key={method._id}>
                        {method._id}: ${method.total}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Donation;
