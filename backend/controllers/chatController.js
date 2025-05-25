const Message = require('../models/Message');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Send message (User or Admin)
exports.sendMessage = async (req, res) => {
  const { text, receiverId } = req.body;
  const senderType = req.user ? 'user' : 'admin';
  const senderId = req.user?._id || req.admin?._id;

  try {
    const message = await Message.create({
      senderType,
      senderId,
      receiverId,
      text,
      isRead: false,
    });

    res.status(201).json(message);

    await User.findByIdAndUpdate(receiverId, {
      $push: {
        notifications: {
          type: 'message',
          title: 'New Message',
          message: text
        }
      }
    });
    
  } catch (err) {
    res.status(500).json({ message: 'Message send failed', error: err.message });
  }
};

// Fetch conversation between user and admin
exports.getConversation = async (req, res) => {
  const userId = req.params.userId;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load messages', error: err.message });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  const { fromId } = req.body;
  const receiverId = req.user?._id || req.admin?._id;

  try {
    await Message.updateMany(
      { senderId: fromId, receiverId, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as read', error: err.message });
  }
};

// Get admin chat list with recent message
exports.getAdminChatList = async (req, res) => {
  try {
    const users = await User.find();
    const chats = await Promise.all(users.map(async (user) => {
      const lastMessage = await Message.findOne({
        $or: [
          { senderId: user._id },
          { receiverId: user._id }
        ]
      }).sort({ timestamp: -1 });

      const unreadCount = await Message.countDocuments({
        senderId: user._id,
        receiverId: req.admin._id,
        isRead: false
      });

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.profilePicture,
          isOnline: user.isOnline || false, // optional real-time field
          lastSeen: user.lastSeen || 'N/A'
        },
        lastMessage: lastMessage?.text || '',
        timestamp: lastMessage?.timestamp || null,
        unread: unreadCount
      };
    }));

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load chat list', error: err.message });
  }
};
