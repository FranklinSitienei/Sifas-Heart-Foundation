const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');
const notificationController = require('../controllers/notificationController');

// User Routes
router.get('/user/unread', authMiddleware, notificationController.getUnreadNotifications);
router.get('/user', authMiddleware, notificationController.getAllNotifications);
router.post('/mark-as-read/:id', authMiddleware, notificationController.markAsRead);
router.delete('/delete/:id', authMiddleware, deleteNotification);

// Admin Routes
router.get('/admin/all', adminMiddleware, notificationController.getAdminNotifications);
router.get('/admin/unread', authMiddleware, notificationController.getAdminUnreadNotifications);
router.post('/admin/mark-all-as-read', adminMiddleware, notificationController.markAllAsReadAdmin);
router.delete('/admin/delete/:id', adminMiddleware, deleteNotification);

module.exports = router;
