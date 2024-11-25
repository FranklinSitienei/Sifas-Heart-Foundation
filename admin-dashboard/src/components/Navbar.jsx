import React, { useEffect, useState } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import {
  FaUserCircle,
  FaBell,
  FaChevronDown,
  FaHome,
  FaDonate,
  FaInfoCircle,
  FaChevronUp,
  FaBlog,
  FaSearch
} from "react-icons/fa";
import NotificationModal from "./NotificationModal";
import Sidebar from './Sidebar';
import '../css/Navbar.css';

const Navbar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const token = localStorage.getItem("admin");
    const [showSearchBar, setShowSearchBar] = useState(false);

    // Update the `showSearchBar` state based on window width
    useEffect(() => {
        const handleResize = () => {
            setShowSearchBar(window.innerWidth <= 768);
        };

        handleResize(); // Initialize the state
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        if (token) {
            const fetchUserProfile = async () => {
                try {
                    const response = await fetch(
                        "https://sifas-heart-foundation.onrender.com/api/admin/profile",
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        setProfile(data);
                    } else {
                        console.error("Failed to fetch user profile");
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            };

            fetchUserProfile();
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            const fetchUnreadCount = async () => {
                try {
                    const response = await fetch(
                        "https://sifas-heart-foundation.onrender.com/api/notifications/admin/all",
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        setUnreadCount(data.unreadCount);
                    } else {
                        console.error("Failed to fetch unread notifications count");
                    }
                } catch (error) {
                    console.error("Error fetching unread notifications count:", error);
                }
            };

            fetchUnreadCount();
        }
    }, [token]);

    const toggleDropdown = () => {
        setActiveDropdown(activeDropdown === "profile" ? null : "profile");
        setNotificationsOpen(false);
    };

    const toggleNotifications = () => {
        setModalOpen(!modalOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    return (
        <nav className="navbar">
            {isSidebarOpen && <Sidebar />}
            <div className="search-bar">
                <input type="text" placeholder="Search..." />
                <FaSearch />
            </div>
            <div className="navbar-icons">
                {token ? (
                    <>
                        <div className="profile-container" onClick={toggleDropdown}>
                            <div className="profile-pic">
                                {profile && profile.profilePicture ? (
                                    <img
                                        src={profile.profilePicture}
                                        alt="Profile"
                                        className="profile-image"
                                    />
                                ) : (
                                    <FaUserCircle className="profile-icon" />
                                )}
                            </div>
                            <FaChevronDown className="dropdown-icon" />
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
                        <div
                            className="notification-icon"
                            onClick={toggleNotifications}
                        >
                            <FaBell />
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </div>
                        {modalOpen && (
                            <NotificationModal 
                                token={token}
                                onClose={() => setModalOpen(false)}
                            />
                        )}
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">
                            Login
                        </Link>
                        <Link to="/signup" className="nav-button">
                            Sign Up
                        </Link>
                    </>
                )}
            </div>

            {/* Bottom Navbar for mobile
            <div className="mobile-nav">
                <NavLink to="/" className="nav-icon">
                    <FaHome />
                </NavLink>
                <NavLink to="/donations" className="nav-icon">
                    <FaDonate />
                </NavLink>
                <NavLink to="/about" className="nav-icon">
                    <FaInfoCircle />
                </NavLink>
                <NavLink to="/blogs" className="nav-link">
                    <FaBlog />
                </NavLink>
                {token ? (
                    <div className="nav-icon" onClick={toggleDropdown}>
                        {profile && profile.profilePicture ? (
                            <img
                                src={profile.profilePicture}
                                alt="Profile"
                                className="profile-image"
                            />
                        ) : (
                            <FaUserCircle />
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
                    <>
                        <NavLink to="/login" className="nav-icon">
                            <FaUserCircle />
                        </NavLink>
                    </>
                )}
            </div> */}
        </nav >
    );
};

export default Navbar;
