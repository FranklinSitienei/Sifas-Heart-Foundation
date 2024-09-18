const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  fetchChatMessages,
  sendMessage,
  checkAdminStatus,
  handleComplexMessage,
  editMessage,
  deleteMessage
} = require('../controllers/chatController');

const router = express.Router();

// Fetch chat messages
router.get('/messages', authMiddleware, fetchChatMessages);

// Send a message
router.post('/send', authMiddleware, sendMessage);

// Check if the secretary/admin is online
router.get('/secretary-status', authMiddleware, checkAdminStatus);

// Flag a message as complex
router.post('/complex', authMiddleware, handleComplexMessage);

// Edit a message
router.post('/edit', authMiddleware, editMessage);

// Delete a message
router.post('/delete', authMiddleware, deleteMessage);

module.exports = router;
