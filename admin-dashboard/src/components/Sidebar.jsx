// Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaDonate, FaBlog } from 'react-icons/fa';
import { BiChart, BiTable } from 'react-icons/bi';
import { MdCreate, MdEdit, MdViewList, MdChat, MdMenu, MdOutlineLogout, MdOutlineFileUpload } from 'react-icons/md'; // Importing icons
import '../css/Sidebar.css';
import axios from 'axios';

const Sidebar = () => {
    const [messageCount, setMessageCount] = useState(0);
    const [isCollapsed, setIsCollapsed] = useState(false); // New state for collapse toggle
    const navigate = useNavigate();

    const token = localStorage.getItem("admin");

    useEffect(() => {
        const fetchMessageCount = async () => {
            try {
                const response = await axios.get('https://sifas-heart-foundation.onrender.com/api/chat/admin/all',
                    { headers: { Authorization: `Bearer ${token}` } }
                );
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
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-section">
                <h2>{!isCollapsed && "Dashboard"}</h2>
                <NavLink to="/" className="sidebar-link">
                    <FaTachometerAlt /> {!isCollapsed && "Dashboard"}
                </NavLink>
            </div>
            <div className="sidebar-section">
                <h2>{!isCollapsed && "Donations"}</h2>
                <NavLink to="/donations" className="sidebar-link">
                    <FaDonate /> {!isCollapsed && "Donations"}
                </NavLink>
                <NavLink to="/donation-charts" className="sidebar-link">
                    <BiChart /> {!isCollapsed && "Donation Charts"}
                </NavLink>
                <NavLink to="/transactions" className="sidebar-link">
                    <BiTable /> {!isCollapsed && "Transaction Table"}
                </NavLink>
            </div>
            <div className="sidebar-section">
                <h2>{!isCollapsed && "Blogs"}</h2>
                <NavLink to="/create-blog" className="sidebar-link">
                    <MdOutlineFileUpload /> {!isCollapsed && "Create Blog"}
                </NavLink>
                <NavLink to="/all-blogs" className="sidebar-link">
                    <MdViewList /> {!isCollapsed && "All Blogs"}
                </NavLink>
                <NavLink to="/edit-blog" className="sidebar-link">
                    <MdEdit /> {!isCollapsed && "Edit Blog"}
                </NavLink>
            </div>
            <div className="sidebar-section">
                <h2>{!isCollapsed && "Chat"}</h2>
                <NavLink to="/chat" className="sidebar-link">
                    <MdChat /> {!isCollapsed && `Chat (${messageCount})`}
                </NavLink>
            </div>
            <div className="sidebar-section">
                <h2>{!isCollapsed && "Account"}</h2>
                <NavLink to="/login" className="sidebar-link" onClick={handleLogout}>
                    <MdOutlineLogout /> {!isCollapsed && "Logout"}
                </NavLink>
            </div>
            {/* Toggle Button */}
            <div className="sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
                <MdMenu />
            </div>
        </aside>
    );
};

export default Sidebar;
