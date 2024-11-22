import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { RiDeleteBin5Line } from "react-icons/ri";
import '../css/NotificationModal.css';

const NotificationModal = ({ token, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch(
                    "https://sifas-heart-foundation.onrender.com/api/notifications",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data);
                } else {
                    console.error("Failed to fetch notifications");
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [token]);

    const markAsRead = async (id) => {
        try {
            const response = await fetch(
                `https://sifas-heart-foundation.onrender.com/api/notifications/${id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                setNotifications(
                    notifications.map((notification) =>
                        notification._id === id
                            ? { ...notification, read: true }
                            : notification
                    )
                );
            } else {
                console.error("Failed to mark notification as read");
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            const response = await fetch(
                `https://sifas-heart-foundation.onrender.com/api/notifications/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                setNotifications(
                    notifications.filter((notification) => notification._id !== id)
                );
            } else {
                console.error("Failed to delete notification");
            }
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    return (
        <div className="notification-modal">
            <div className="notification-header">
                <h2>Notifications</h2>
                <FaTimes className="close-icon" onClick={onClose} />
            </div>
            <div className="notification-body">
                {loading ? (
                    <p>Loading...</p>
                ) : notifications.length === 0 ? (
                    <p>No notifications</p>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                        >
                            <p onClick={() => markAsRead(notification._id)}>
                                {notification.message}
                            </p>
                            <button onClick={() => deleteNotification(notification._id)} className='delete'>
                                <RiDeleteBin5Line />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationModal;
