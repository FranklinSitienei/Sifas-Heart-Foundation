// Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaDonate, FaBlog } from 'react-icons/fa';
import { BiChart, BiTable } from 'react-icons/bi';
import { MdCreate, MdEdit, MdViewList, MdChat } from 'react-icons/md'; // Importing the chat icon
import '../css/Sidebar.css';
import axios from 'axios';

const Sidebar = () => {
    const [messageCount, setMessageCount] = useState(0);
    const navigate = useNavigate(); // useNavigate for redirecting after logout

    const token = localStorage.getItem("admin");

    useEffect(() => {
        const fetchMessageCount = async () => {
            try {
                const response = await axios.get('https://sifas-heart-foundation-1.onrender.com/api/chat/admin/all',
                    {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                );
                setMessageCount(response.data.length); // Set the message count
            } catch (error) {
                console.error('Error fetching message count:', error);
            }
        };

        fetchMessageCount();
    }, [token]);

    const handleLogout = async () => {
        try {
            await axios.get('https://sifas-heart-foundation-1.onrender.com/api/admin/logout', {
                headers: { Authorization: `Bearer ${token}` },
            });
            localStorage.removeItem('admin');
            navigate('/login'); // Redirect to login page after logout
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-section">
                <h2>Dashboard</h2>
                <NavLink to="/" className="sidebar-link">
                    <FaTachometerAlt /> Dashboard
                </NavLink>
            </div>
            <div className="sidebar-section">
                <h2>Donations</h2>
                <NavLink to="/donations" className="sidebar-link">
                    <FaDonate /> Donations
                </NavLink>
                <NavLink to="/donation-charts" className="sidebar-link">
                    <BiChart /> Donation Charts
                </NavLink>
                <NavLink to="/transactions" className="sidebar-link">
                    <BiTable /> Transaction Table
                </NavLink>
            </div>
            <div className="sidebar-section">
                <h2>Blogs</h2>
                <NavLink to="/create-blog" className="sidebar-link">
                    <MdCreate /> Create Blog
                </NavLink>
                <NavLink to="/all-blogs" className="sidebar-link">
                    <MdViewList /> All Blogs
                </NavLink>
                <NavLink to="/edit-blog" className="sidebar-link">
                    <MdEdit /> Edit Blog
                </NavLink>
            </div>
            <div className="sidebar-section">
                <h2>Chat</h2>
                <NavLink to="/chat" className="sidebar-link">
                    <MdChat /> Chat ({messageCount}) {/* Displaying message count */}
                </NavLink>
            </div>
            <div className="sidebar-section">
                <h2>Account</h2>
                <NavLink to="/login" className="sidebar-link" onClick={handleLogout}>
                    Logout {/* Add logout link */}
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;
