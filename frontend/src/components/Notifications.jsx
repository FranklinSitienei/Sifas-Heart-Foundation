import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://sifas-heart-foundation.onrender.com/api/auth/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sortedNotifications = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setNotifications(sortedNotifications);
        setUnreadCount(sortedNotifications.filter(notification => !notification.read).length);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`https://sifas-heart-foundation.onrender.com/api/auth/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(notification => 
        notification._id === id ? { ...notification, read: true } : notification
      ));
      setUnreadCount(prevCount => prevCount - 1);
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('https://sifas-heart-foundation.onrender.com/api/auth/notifications/mark-all-read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="notification-container">
      <h2 className="title">Notifications {unreadCount > 0 && <span className="badge">{unreadCount}</span>}</h2>
      <button onClick={markAllAsRead} className="mark-all-button">Mark All as Read</button>
      <ul className="notification-list">
        {notifications.map(notification => (
          <li key={notification._id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
            <span>{notification.message}</span>
            {!notification.read && (
              <button onClick={() => markAsRead(notification._id)} className="mark-read-button">
                Mark as Read
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
