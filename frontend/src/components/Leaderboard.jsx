import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import '../css/Leaderboard.css';

const months = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
];

const Leaderboard = () => {
    const [data, setData] = useState([]);
    const [userProfile, setUserProfile] = useState(null); // To store the user profile data
    const [authError, setAuthError] = useState(false);
    const navigate = useNavigate(); // Use navigate for redirection in case of auth errors
    const currentYear = new Date().getFullYear();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Get user’s local timezone

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setAuthError(true);
                navigate('/login');
                return;
            }

            try {
                // Fetch user profile data
                const profileResponse = await fetch('https://sifas-heart-foundation-2.onrender.com/api/auth/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (profileResponse.ok) {
                    const userData = await profileResponse.json();
                    setUserProfile(userData); // Set the user profile data

                    // Fetch leaderboard data
                    const leaderboardResponse = await fetch(`https://sifas-heart-foundation-2.onrender.com/api/leaderboards/monthly?year=${currentYear}&timezone=${timezone}`);
                    const leaderboardData = await leaderboardResponse.json();
                    setData(leaderboardData);
                } else {
                    setAuthError(true);
                }
            } catch (error) {
                setAuthError(true);
            }
        };

        checkAuth();
    }, [currentYear, timezone, navigate]);

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
            {authError ? (
                <p>Error loading user data. Please log in.</p>
            ) : (
                <>
                    {userProfile && (
                        <div className="user-profile">
                            <h3>Welcome, {userProfile.firstName} {userProfile.lastName}</h3>
                            <p>Email: {userProfile.email}</p>
                            <p>Phone: {userProfile.mobileNumber || 'Not provided'}</p>
                        </div>
                    )}

                    <div className="chart-container">
                        <h2>Donations Per Month</h2>
                        <ResponsiveContainer width="100%" height={250}> {/* Smaller height */}
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
                        <ResponsiveContainer width="100%" height={250}> {/* Smaller height */}
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
                                <li key={item.user?._id}>
                                    {index + 1}. {item.user?.firstName || 'Unknown User'} - Donations: {item.donationCount}, Logins: {item.loginCount}
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
};

export default Leaderboard;
