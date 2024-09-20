import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaUserCircle, FaBell, FaChevronDown } from "react-icons/fa";
import NotificationModal from "./NotificationModal";
import "../css/Navbar.css";
import logo from "../images/logo.jpg";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      const fetchUserProfile = async () => {
        try {
          const response = await fetch(
            "https://sifas-heart-foundation-2.onrender.com/api/auth/profile",
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
            "https://sifas-heart-foundation-2.onrender.com/api/notifications/unread-count",
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
    <nav>
      <div className="nav-container">
        <div className="nav-flex">
          <div className="nav-brand">
            <Link to="/" className="nav-brand-link">
              <img
                src={logo}
                alt="Logo"
                style={{ width: "70px", height: "50px" }} // Styling the logo image
              />
            </Link>
          </div>

          <div className="nav-links">
            <NavLink to="/" className="nav-link" exact>
              Home
            </NavLink>
            <NavLink to="/donations" className="nav-link">
              Donations
            </NavLink>
            <NavLink to="/about" className="nav-link">
              About Us
            </NavLink>
          </div>

          <div className="nav-links">
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
                      <button
                        onClick={handleLogout}
                        className="dropdown-item"
                      >
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
                    <span className="notification-badge">
                      {unreadCount}
                    </span>
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
