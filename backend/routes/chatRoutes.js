// chatRoutes.js
const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/adminMiddleware");
const {
    fetchChatMessages,
    sendMessage,
    checkAdminStatus,
    handleComplexMessage,
    editMessage,
    deleteMessage,
    getUserChats,
    fetchChatDetails,
    replyMessage,
    setUserOnline,
    setUserOffline,
} = require("../controllers/chatController");

const router = express.Router();

// User routes
router.get("/messages", authMiddleware, fetchChatMessages);
router.post("/send", authMiddleware, sendMessage);
router.post("/user/online", authMiddleware, setUserOnline);
router.post("/user/offline", authMiddleware, setUserOffline);
router.get("/secretary-status", authMiddleware, checkAdminStatus);
router.post("/complex", authMiddleware, handleComplexMessage);
router.post("/edit/:chatId", authMiddleware, editMessage);
router.post("/delete/:chatId", authMiddleware, deleteMessage);
router.get("/all", authMiddleware, getUserChats);

// Admin routes - Define specific routes first
router.post("/admin/send", adminMiddleware, sendMessage);
router.post("/admin/edit", adminMiddleware, editMessage);
router.post("/admin/delete/:chatId", adminMiddleware, deleteMessage);
router.get("/admin/all", adminMiddleware, getUserChats);
router.post('/admin/reply/:chatId', adminMiddleware, replyMessage);

// Generic admin route - Define last
router.get('/admin/:chatId', adminMiddleware, fetchChatDetails);

module.exports = router;
