import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaDonate, FaBlog, FaSearch } from 'react-icons/fa';
import { BiChart, BiTable } from 'react-icons/bi';
import { MdCreate, MdEdit, MdViewList, MdChat, MdMenu, MdOutlineLogout, MdAccountCircle } from 'react-icons/md';
import '../css/MobileNavbar.css';
import axios from 'axios';

const MobileNavbar = ({ toggleSearch }) => {
    const [messageCount, setMessageCount] = useState(0);
    const [showMore, setShowMore] = useState(false); // To toggle extra icons
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [profile, setProfile] = useState(null);
    const token = localStorage.getItem("admin");

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
        const fetchMessageCount = async () => {
            try {
                const response = await axios.get('https://sifas-heart-foundation.onrender.com/api/chat/admin/all', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMessageCount(response.data.length);
            } catch (error) {
                console.error('Error fetching message count:', error);
            }
        };

        fetchMessageCount();
    }, [token]);

    const handleLogout = async () => {
        try {
            await axios.get('https://sifas-heart-foundation.onrender.com/api/admin/logout', {
                headers: { Authorization: `Bearer ${token}` },
            });
            localStorage.removeItem('admin');
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const mainIcons = [
        { path: '/', icon: <FaTachometerAlt />, label: 'Dashboard' },
        { path: '/donations', icon: <FaDonate />, label: 'Donations' },
        { path: '/donation-charts', icon: <BiChart />, label: 'Charts' },
        { path: '/transactions', icon: <BiTable />, label: 'Transactions' },
    ];

    const extraIcons = [
        { path: '/create-blog', icon: <MdCreate />, label: 'Create Blog' },
        { path: '/all-blogs', icon: <MdViewList />, label: 'All Blogs' },
        { path: '/edit-blog', icon: <MdEdit />, label: 'Edit Blog' },
        { path: '/chat', icon: <MdChat />, label: `Chat (${messageCount})` },
    ];

    return (
        <div className="mobile-navbar">
            {/* Search Icon */}
            <button onClick={toggleSearch} className="navbar-icon">
                <FaSearch />
            </button>

            {mainIcons.map((item, index) => (
                <NavLink key={index} to={item.path} className="navbar-icon">
                    {item.icon}
                </NavLink>
            ))}

            <div className="navbar-icon" onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}>
                {profile && profile.profilePicture ? (
                    <img
                        src={profile.profilePicture}
                        alt="Profile"
                        className="profile-image"
                    />
                ) : (
                    <MdAccountCircle className="profile-icon" />
                )}
                {isAccountMenuOpen === "profile" && (
                    <div className="account-dropdown">
                        <NavLink to="/account" className="dropdown-item">
                            Account
                        </NavLink>
                        <button onClick={handleLogout} className="dropdown-item">
                            Logout
                        </button>
                    </div>
                )}
            </div>

            {/* <button className="navbar-icon" onClick={() => setShowMore(!showMore)}>
                <MdMenu />
            </button>

            {showMore && (
                <div className="sidebar-overlay">
                    <div className="extra-icons">
                        {extraIcons.map((item, index) => (
                            <NavLink key={index} to={item.path} className="extra-icon">
                                {item.icon} <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            )} */}
        </div>
    );
};

export default MobileNavbar;
