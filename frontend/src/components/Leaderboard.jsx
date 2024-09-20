import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../css/Leaderboard.css';

const months = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
];

const Leaderboard = () => {
    const [data, setData] = useState([]);
    const currentYear = new Date().getFullYear();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Get user’s local timezone

    useEffect(() => {
        // Fetch leaderboard data for the current year and timezone
        fetch(`https://sifas-heart-foundation-2.onrender.com/api/leaderboards/monthly?year=${currentYear}&timezone=${timezone}`)
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => console.error('Error fetching leaderboard:', error));
    }, [currentYear, timezone]);

    // Format data for the chart
    const chartData = months.map((month, index) => {
        const donations = data.reduce((acc, item) => {
            const stats = item.monthlyStats.find(stat => stat.month === index + 1 && stat.year === currentYear);
            return acc + (stats ? stats.donationCount : 0);
        }, 0);

        const logins = data.reduce((acc, item) => {
            const stats = item.monthlyStats.find(stat => stat.month === index + 1 && stat.year === currentYear);
            return acc + (stats ? stats.loginCount : 0);
        }, 0);

        return { month, donations, logins };
    });

    return (
        <div className="leaderboard-container">
            <div className="chart-container">
                <h2>Donations Per Month</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="donations" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="chart-container">
                <h2>Logins Per Month</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="logins" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="leaderboard">
                <h2>Leaderboard</h2>
                <ul>
                    {data.map((item, index) => (
                        <li key={item.user._id}>
                            {index + 1}. {item.user.firstName || item.user.name} - Donations: {item.donationCount}, Logins: {item.loginCount}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Leaderboard;
