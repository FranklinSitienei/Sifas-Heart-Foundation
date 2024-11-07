import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaBell, FaUserCircle, FaChevronUp } from 'react-icons/fa';
import Sidebar from './Sidebar'; 
import '../css/Navbar.css';

const Navbar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [admin, setAdmin] = useState(null);
    const [notificationCount, setNotificationCount] = useState(0);
    const navigate = useNavigate();
    const [activeDropdown, setActiveDropdown] = useState(false);

    useEffect(() => {
        const fetchAdminProfile = async () => {
            const token = localStorage.getItem('admin');
            if (!token) {
                return navigate('/login');
            }

            try {
                const response = await axios.get('https://sifas-heart-foundation-1.onrender.com/api/admin/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAdmin(response.data);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('admin');
                    navigate('/login');
                }
            }
        };
        fetchAdminProfile();
    }, [navigate]);

    const handleLogout = async () => {
        const token = localStorage.getItem('admin');
        try {
            await axios.get('https://sifas-heart-foundation-1.onrender.com/api/admin/logout', {
                headers: { Authorization: `Bearer ${token}` },
            });
            localStorage.removeItem('admin');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const toggleDropdown = () => {
        setActiveDropdown((prev) => !prev);
        console.log("Dropdown active state:", activeDropdown);
    };
    
    return (
        <nav className="navbar">
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
                <div className="profile-container" onClick={toggleDropdown}>
                    {admin && admin.profilePicture ? (
                        <img
                            src={admin.profilePicture}
                            alt="Profile"
                            className="profile-image"
                        />
                    ) : (
                        <FaUserCircle className="account-icon" />
                    )}
                    <FaChevronUp className={`dropdown-icon ${activeDropdown ? 'rotate' : ''}`} />
                </div>
                {activeDropdown && (
                    <div className="dropdown-menu">
                        <Link to="/account" className="dropdown-item">
                            Account
                        </Link>
                        <button onClick={handleLogout} className="dropdown-item">
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
