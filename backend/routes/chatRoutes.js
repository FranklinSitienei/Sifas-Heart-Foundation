const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authMiddleware } = require('../middlewares/auth');
const { adminMiddleware } = require('../middlewares/admin');

// For both users and admins
router.post('/send', authMiddleware, chatController.sendMessage);
router.post('/read', authMiddleware, chatController.markAsRead);
router.get('/conversation/:userId', authMiddleware, chatController.getConversation);

// Admin-only chat list view
router.get('/admin/conversations', adminMiddleware, chatController.getAdminChatList);

module.exports = router;
