const Chat = require("../models/Chat");
const { io } = require('../server');
const Admin = require("../models/Admin");
const Notification = require("../models/Notification");
const { handleAdminChatAchievements } = require("../utils/achievementUtils");
const User = require("../models/User");

// Send a message from the user
exports.sendMessage = async (req, res) => {
  const { message, emoji } = req.body;
  const userId = req.user.id;

  try {
    let chat = await Chat.findOne({ userId });

    if (!chat) {
      chat = new Chat({ userId });
    }

    const newMessage = {
      from: 'user',
      text: message,
      emoji,
      createdAt: new Date()
    };
    chat.messages.push(newMessage);
    chat.lastActive = Date.now();
    await chat.save();

    io.emit('message', { userId, ...newMessage }); 

    // Increment chat count for user achievements
    const user = await User.findById(userId);
    if (user) {
      user.chatCount = user.chatCount ? user.chatCount + 1 : 1;
      await user.save();
    }

    // Handle complex messages
    const complexKeywords = ["issue", "problem", "urgent"];
    if (complexKeywords.some((keyword) => message.toLowerCase().includes(keyword))) {
      chat.isComplex = true;
      await chat.save();
      const admin = await Admin.findOne({ isOnline: true });
      if (admin) {
        await Notification.create({
          userId: chat.adminId,
          message: "A complex query requires your attention.",
          type: "admin_chat",
        });
      }
    }

    res.json({ from: 'user', text: message, emoji, createdAt: new Date() });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).send("Server error");
  }
};

// Send a reply from the admin
exports.replyMessage = async (req, res) => {
  const { message } = req.body;
  const adminId = req.admin.id;
  const chatId = req.params.chatId;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ msg: "Chat not found" });

    const replyMessage = {
      from: 'admin',
      text: message,
      createdAt: new Date()
    };
    chat.messages.push(replyMessage);
    await chat.save();

    io.emit('adminReply', { chatId, ...replyMessage }); // Emit admin reply event

    res.json({ msg: "Reply sent successfully", message });
  } catch (error) {
    console.error("Error sending reply:", error);
    res.status(500).send("Server error");
  }
};

// Edit message
exports.editMessage = async (req, res) => {
  const { messageId, newText } = req.body;
  const userId = req.user ? req.user.id : req.admin.id; // Get user or admin ID

  try {
    let chat = await Chat.findOne({ userId });
    if (!chat) return res.status(404).json({ msg: "No chat found" });

    const message = chat.messages.id(messageId);
    if (!message) return res.status(404).json({ msg: "Message not found" });

    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    if (messageAge > 30000) return res.status(400).json({ msg: "Editing time expired" });

    message.text = newText;
    await chat.save();

    io.emit('messageEdited', { chatId: chat.id, messageId, newText }); // Emit the edited message in real-time
    res.json({ msg: "Message updated successfully" });
  } catch (error) {
    console.error("Error editing message:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  const { messageId } = req.body;
  const userId = req.user ? req.user.id : req.admin.id; // Get user or admin ID

  try {
    let chat = await Chat.findOne({ userId });
    if (!chat) return res.status(404).json({ msg: "No chat found" });

    const message = chat.messages.id(messageId);
    if (!message) return res.status(404).json({ msg: "Message not found" });

    chat.messages.pull({ _id: messageId });
    await chat.save();

    io.emit('messageDeleted', { chatId: chat.id, messageId }); // Emit the deleted message event

    res.json({ msg: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Fetch chat messages
exports.fetchChatMessages = async (req, res) => {
  const userId = req.user.id; // Only fetching for user

  try {
    if (!userId) return res.status(400).json({ msg: "Invalid user ID" });

    const chat = await Chat.findOne({ userId }).populate("adminId");
    if (!chat) return res.status(404).json({ msg: "No chat found" });

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (chat.lastActive < twentyFourHoursAgo && chat.messages.length === 0) {
      return res.json({ messages: [] });
    }

    // Automated responses based on previous user messages
    let autoResponse = "";
    const lastMessage = chat.messages[chat.messages.length - 1];

    if (lastMessage && lastMessage.from === 'user') {
      if (lastMessage.text.toLowerCase().includes("hello")) {
        autoResponse = "Hi there! How can I assist you today? 😊";
      } else if (lastMessage.text.toLowerCase().includes("help")) {
        autoResponse = "Sure! What do you need help with?";
      }

      if (autoResponse) {
        chat.messages.push({
          from: "admin",
          text: autoResponse,
          createdAt: new Date(),
        });
        await chat.save();
        await handleAdminChatAchievements(userId);
      }
    }

    res.json({ messages: chat.messages });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Check if an admin/secretary is online
exports.checkAdminStatus = async (req, res) => {
  try {
    const admin = await Admin.findOne({ isOnline: true });
    if (!admin) return res.json({ isOnline: false });

    res.json({
      isOnline: true,
      secretary: {
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        profilePicture: admin.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Handle complex messages
exports.handleComplexMessage = async (req, res) => {
  const userId = req.user ? req.user.id : req.admin.id; // Get user or admin ID
  const { messageId } = req.body;

  try {
    const chat = await Chat.findOne({ userId });
    if (!chat) return res.status(404).json({ msg: "No chat found" });

    const message = chat.messages.id(messageId);
    if (!message) return res.status(404).json({ msg: "Message not found" });

    chat.isComplex = true;
    await chat.save();

    // Notify the admin
    await Notification.create({
      userId: chat.adminId,
      message: "A complex query requires your attention.",
      type: "admin_chat",
    });

    res.json({ msg: "Message flagged as complex and admin notified" });
  } catch (error) {
    console.error("Error handling complex message:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Fetch all user chats (Admin)
exports.getUserChats = async (req, res) => {
  try {
    const userChats = await Chat.find()
      .sort({ lastActive: -1 })
      .populate('userId', 'firstName lastName profilePicture');

    res.json(userChats); // Ensure this is an array
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Fetch chat details by chatId
exports.fetchChatDetails = async (req, res) => {
  const chatId = req.params.chatId; // Correctly extract chatId

  try {
    const chat = await Chat.findById(chatId)
      .populate('userId', 'firstName lastName profilePicture isOnline lastSeen'); // Populate user details

    if (!chat) return res.status(404).json({ msg: "Chat not found" });

    res.json({
      messages: chat.messages,
      user: chat.userId, // Send user details
    });
  } catch (error) {
    console.error("Error fetching chat details:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Set user online
exports.setUserOnline = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.isOnline = true;
    await user.save();

    io.emit('userOnline', { userId, isOnline: true });

    res.json({ msg: 'User is now online' });
  } catch (error) {
    console.error('Error updating user online status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Set user offline
exports.setUserOffline = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.isOnline = false;
    user.lastSeen = new Date();
    await user.save();

    io.emit('userOffline', { userId, isOnline: false });

    res.json({ msg: 'User is now offline' });
  } catch (error) {
    console.error('Error updating user offline status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Set admin online status
exports.setAdminOnline = async (req, res) => {
  const adminId = req.admin.id;

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ msg: 'Admin not found' });

    admin.isOnline = true;
    await admin.save();

    io.emit('adminOnline', { adminId, isOnline: true });
    res.json({ msg: 'Admin is now online' });
  } catch (error) {
    console.error('Error updating admin online status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Set admin offline status
exports.setAdminOffline = async (req, res) => {
  const adminId = req.admin.id;

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ msg: 'Admin not found' });

    admin.isOnline = false;
    await admin.save();

    io.emit('adminOffline', { adminId, isOnline: false });
    res.json({ msg: 'Admin is now offline' });
  } catch (error) {
    console.error('Error updating admin offline status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.markAsRead = async (req, res) => {
  const { chatId } = req.params;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ msg: "Chat not found" });

    chat.isRead = true;
    await chat.save();

    io.emit('chatRead', { chatId });
    res.json({ msg: "Chat marked as read" });
  } catch (error) {
    console.error("Error marking chat as read:", error);
    res.status(500).json({ error: "Server error" });
  }
};
