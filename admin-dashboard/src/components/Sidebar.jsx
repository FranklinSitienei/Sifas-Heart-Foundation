import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaDonate, FaBlog } from 'react-icons/fa';
import { BiChart, BiTable } from 'react-icons/bi';
import { MdCreate, MdEdit, MdViewList } from 'react-icons/md';
import '../css/Sidebar.css';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-section">
                <h2>Dashboard</h2>
                <NavLink to="/dashboard" className="sidebar-link">
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
        </aside>
    );
};

export default Sidebar;
