const { io } = require('../server'); // Import Socket.IO instance
const Notification = require('../models/Notification');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

// Create a notification
const createNotification = async (userId, message, type) => {
    try {
        const notification = new Notification({
            userId,
            message,
            type,
        });
        await notification.save();

        // Check if the user has an active socket connection
        const socketConnected = io.sockets.sockets.get(userId.toString());
        if (socketConnected) {
            io.to(userId.toString()).emit('new-notification', notification);
        } else {
            console.warn(`User ${userId} is not connected to the socket.`);
        }
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// Notify user for achievements
exports.notifyAchievement = async (userId, title) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error(`User with ID ${userId} not found.`);
        const message = `Congratulations! You've earned a new achievement: ${title}`;
        await createNotification(userId, message, 'achievement');
    } catch (error) {
        console.error('Error notifying achievement:', error.message);
    }
};

// Notify user after donation
exports.notifyDonation = async (userId, amount, transactionId) => {
    const message = `Thank you for your donation of $${amount}. Your transaction ID is ${transactionId}.`;
    await createNotification(userId, message, 'donation');
};

// Notify admin when a chat message is received
exports.notifyAdminChat = async (userId, message) => {
    const admin = await Admin.findOne({ isOnline: true }); // Get online admin
    if (admin) {
        const adminMessage = `New message from user ${userId}: "${message}"`;
        await createNotification(admin._id, adminMessage, 'admin_chat');
    }
};

// Notify user on successful login
exports.notifyLogin = async (userId) => {
    const message = `You successfully logged in.`;
    await createNotification(userId, message, 'login');
};

// Notify user when new reply to comment
exports.notifyNewReply = async (userId, commentId) => {
    const message = `You have a new reply to your comment.`;
    await createNotification(userId, message, 'update');
};

// Notify user when admin goes online
exports.notifyAdminOnline = async (adminId) => {
    const message = `Admin is now online and available for chat.`;
    const users = await User.find(); // Notify all users
    users.forEach(async (user) => {
        await createNotification(user._id, message, 'admin_chat');
    });
};

// Notify user on successful signup
exports.notifySignup = async (userId) => {
    const message = `Welcome! Your account was successfully created.`;
    await createNotification(userId, message, 'signup');
};

// Notify user on email recovery request
exports.notifyEmailRecovery = async (userId) => {
    const message = `You requested a password recovery. Please check your email for instructions.`;
    await createNotification(userId, message, 'email_recovery');
};

// Get unread notifications for the user
exports.getUnreadNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.user.id,
            read: false
        }).sort({ date: -1 });

        res.status(200).json(notifications);
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ message: "Server error", error: err });
    }
};

// Get unread notifications for the user
exports.getAdminUnreadNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            adminId: req.admin.id,
            read: false
        }).sort({ date: -1 });

        res.status(200).json(notifications);
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ message: "Server error", error: err });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );

        if (!notification) return res.status(404).json({ message: "Notification not found" });

        res.status(200).json({ message: "Notification marked as read" });
    } catch (err) {
        console.error("Error marking notification as read:", err);
        res.status(500).json({ message: "Server error", error: err });
    }
};

// Fetch all notifications for a user (admin or user)
exports.getAllNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.find({ userId })
            .sort({ date: -1 });

        res.status(200).json(notifications);
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ message: "Server error", error: err });
    }
};

// Fetch all notifications for an admin
exports.getAdminNotifications = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const notifications = await Notification.find({ adminId })
            .sort({ date: -1 });

        res.status(200).json(notifications);
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ message: "Server error", error: err });
    }
};

// Mark all notifications as read for the admin
exports.markAllAsReadAdmin = async (req, res) => {
    try {
        await Notification.updateMany(
            { adminId: req.admin.id, read: false },
            { read: true }
        );

        res.status(200).json({ message: "All notifications marked as read" });
    } catch (err) {
        console.error("Error marking notifications as read:", err);
        res.status(500).json({ message: "Server error", error: err });
    }
};

// Delete a specific notification
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (err) {
        console.error("Error deleting notification:", err);
        res.status(500).json({ message: "Server error", error: err });
    }
};

module.exports = {
    notifyAchievement,
    notifyDonation,
    notifyAdminChat,
    notifyLogin,
    notifyNewReply,
    notifyAdminOnline,
    notifySignup,
    notifyEmailRecovery,
    getUnreadNotifications,
    getAdminUnreadNotifications,
    markAsRead,
    getAllNotifications,
    getAdminNotifications,
    markAllAsReadAdmin,
    deleteNotification
};

console.log('Exports:', { notifyAchievement }); // Check if undefined
