import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaBell, FaUserCircle } from 'react-icons/fa';
import Sidebar from './Sidebar'; 
import '../css/Navbar.css';

const Navbar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [admin, setAdmin] = useState(null);
    const [notificationCount, setNotificationCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdminProfile = async () => {
            const token = localStorage.getItem('admin');
            try {
                const response = await axios.get('/api/admin/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAdmin(response.data);
            } catch (error) {
                console.error('Failed to fetch admin profile:', error);
            }
        };
        
        fetchAdminProfile();
    }, []);

    const handleLogout = async () => {
        const token = localStorage.getItem('admin');
        try {
            await axios.get('/api/admin/logout', {
                headers: { Authorization: `Bearer ${token}` },
            });
            localStorage.removeItem('admin'); // Clear the token from local storage
            navigate('/login'); // Redirect to login page
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <nav className="navbar">
            {/* <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="toggle-sidebar">
                {isSidebarOpen ? 'Close' : 'Open'} Sidebar
            </button> */}
            {isSidebarOpen && <Sidebar />}
            <div className="search-bar">
                <input type="text" placeholder="Search..." />
                <FaSearch />
            </div>
            <div className="navbar-icons">
                <div className="notification">
                    <FaBell />
                    {notificationCount > 0 && <span className="notification-count">{notificationCount}</span>}
                </div>
                {admin ? (
                    <div className="profile">
                        <img src={admin.profilePicture} alt="Profile" className="profile-picture" />
                        <div className="dropdown">
                            <button className="dropbtn">{admin.firstName}</button>
                            <div className="dropdown-content">
                                <a href="/account">Account</a>
                                <button onClick={handleLogout}>Logout</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <FaUserCircle className="account-icon" onClick={() => console.log('Show login options')} />
                )}
            </div>
        </nav>
    );
};

export default Navbar;
