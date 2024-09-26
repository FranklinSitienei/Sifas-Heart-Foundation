import React, { useEffect, useState } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaBell, FaUserCircle, FaChevronUp } from 'react-icons/fa';
import Sidebar from './Sidebar'; 
import '../css/Navbar.css';

const Navbar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [admin, setAdmin] = useState(null);
    const [notificationCount, setNotificationCount] = useState(0);
    const navigate = useNavigate();
    const [activeDropdown, setActiveDropdown] = useState(null);

    useEffect(() => {
        const fetchAdminProfile = async () => {
            const token = localStorage.getItem('admin');
            console.log('Retrieved token from localStorage:', token); // Debug log
            
            if (!token) {
                console.log('No admin token found, redirecting to login');
                return navigate('/login'); // Redirect to login if token is missing
            }
    
            try {
                const response = await axios.get('http://localhost:5000/api/admin/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('Admin profile fetched successfully:', response.data); // Debug log
                setAdmin(response.data);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    console.error('Unauthorized access, redirecting to login:', error);
                    localStorage.removeItem('admin'); // Remove invalid token
                    navigate('/login'); // Redirect to login if unauthorized
                } else {
                    console.error('Failed to fetch admin profile:', error);
                }
            }
        };
    
        fetchAdminProfile();
    }, [navigate]);    
    
    const handleLogout = async () => {
        const token = localStorage.getItem('admin');
        try {
            await axios.get('http://localhost:5000/api/admin/logout', {
                headers: { Authorization: `Bearer ${token}` },
            });
            localStorage.removeItem('admin'); // Clear the token from local storage
            navigate('/login'); // Redirect to login page
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };    

    const toggleDropdown = () => {
        setActiveDropdown(activeDropdown === "admin" ? null : "admin");
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
                {admin ? (
                    <div className="nav-icon" onClick={toggleDropdown}>
                    {admin && admin.profilePicture ? (
                      <img
                        src={admin.profilePicture}
                        alt="Profile"
                        className="profile-image"
                      />
                    ) : (
                        <FaUserCircle className="account-icon" onClick={() => console.log('Show login options')} />
                    )}
                    <FaChevronUp className="dropdown-icon" />
                    {activeDropdown === "profile" && (
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
                ) : (
                    <FaUserCircle className="account-icon" onClick={() => console.log('Show login options')} />
                )}
            </div>
        </nav>
    );
};

export default Navbar;
