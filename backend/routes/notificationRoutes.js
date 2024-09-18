const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} = require('../controllers/notificationController');

const router = express.Router();

// Create a notification (Admin use)
router.post('/create', authMiddleware, createNotification);

// Fetch user notifications
router.get('/', authMiddleware, getUserNotifications);

// Mark a single notification as read
router.put('/read/:notificationId', authMiddleware, markNotificationAsRead);

// Mark all notifications as read
router.put('/mark-all-read', authMiddleware, markAllNotificationsAsRead);

module.exports = router;
