import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import '../css/Donation.css';

const Donation = () => {
    const [donations, setDonations] = useState([]);
    const [monthlyData, setMonthlyData] = useState({ labels: [], data: [] });

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const response = await axios.get('/api/donations'); // Adjust endpoint as necessary
                setDonations(response.data);
                prepareMonthlyData(response.data);
            } catch (error) {
                console.error('Error fetching donations:', error);
            }
        };

        fetchDonations();
    }, []);

    const prepareMonthlyData = (data) => {
        const labels = [];
        const amounts = [];
        const monthlyTotals = data.reduce((acc, donation) => {
            const month = new Date(donation.date).toLocaleString('default', { month: 'long' });
            acc[month] = (acc[month] || 0) + donation.amount;
            return acc;
        }, {});

        for (const [month, total] of Object.entries(monthlyTotals)) {
            labels.push(month);
            amounts.push(total);
        }

        setMonthlyData({ labels, data: amounts });
    };

    return (
        <div className="donation-container">
            <h1>Monthly Donations</h1>
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
            <h2>Donation Transactions</h2>
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
                            <td>{donation.userFullName}</td>
                            <td>{donation.userEmail}</td>
                            <td>{donation.amount}</td>
                            <td>{donation.paymentMethod}</td>
                            <td>{donation.transactionId}</td>
                            <td>{new Date(donation.date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Donation;
