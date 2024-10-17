const Notification = require('../models/Notification');
const User = require('../models/User');

// Create a notification
exports.createNotification = async (req, res) => {
    const { userId, message, type } = req.body;

    try {
        const notification = new Notification({
            userId,
            message,
            type
        });

        await notification.save();
        res.status(201).json(notification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Fetch notifications for a user
exports.getUserNotifications = async (req, res) => {
    const userId = req.user.id;

    try {
        const notifications = await Notification.find({ userId }).sort({ date: -1 });
        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Mark a notification as read
exports.markNotificationAsRead = async (req, res) => {
    const { notificationId } = req.params;

    try {
        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }

        notification.read = true;
        await notification.save();
        res.json(notification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
    const userId = req.user.id;

    try {
        await Notification.updateMany({ userId, read: false }, { read: true });
        res.json({ msg: 'All notifications marked as read' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Create notification for admin
exports.createAdminNotification = async (req, res) => {
    const { adminId, message, type } = req.body;
  
    try {
      const notification = new Notification({
        userId: adminId,
        message,
        type,
      });
  
      await notification.save();
      res.status(201).json(notification);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };

  // Fetch notifications for a user
exports.getAdminNotifications = async (req, res) => {
    const adminId = req.admin.id;

    try {
        const notifications = await Notification.find({ userId }).sort({ date: -1 });
        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};