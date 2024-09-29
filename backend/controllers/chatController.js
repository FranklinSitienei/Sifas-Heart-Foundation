const Chat = require("../models/Chat");
const Admin = require("../models/Admin");
const Notification = require("../models/Notification");
const { handleAdminChatAchievements } = require("../utils/achievementUtils");
const User = require("../models/User");

// Send a message from the user or admin
exports.sendMessage = async (req, res) => {
  const { message, emoji } = req.body;
  const userId = req.user.id;
  const from = req.user.role === 'admin' ? 'admin' : 'user'; // Check if the sender is admin

  try {
      let chat = await Chat.findOne({ userId });

      if (!chat) {
          chat = new Chat({
              userId,
          });
      }

      chat.messages.push({ from, text: message, emoji, createdAt: new Date() });
      chat.lastActive = Date.now();
      await chat.save();

      // Increment chat count for achievements if the sender is a user
      if (from === 'user') {
          const user = await User.findById(userId);
          if (user) {
              user.chatCount = user.chatCount ? user.chatCount + 1 : 1;
              await user.save();
          }
      }

      // Automated responses
      let autoResponse = "";
      if (message.toLowerCase().includes("hello")) {
          autoResponse = "Hi there! How can I assist you today? 😊";
      } else if (message.toLowerCase().includes("help")) {
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

      // Handle complex messages
      const complexKeywords = ["issue", "problem", "urgent"];
      if (
          complexKeywords.some((keyword) => message.toLowerCase().includes(keyword))
      ) {
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

      res.json({ from, text: message, emoji, createdAt: new Date() });
  } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).send("Server error");
  }
};

// Edit a message
exports.editMessage = async (req, res) => {
  const { messageId, newText } = req.body;
  const userId = req.user.id;

  try {
    let chat = await Chat.findOne({ userId });
    if (!chat) return res.status(404).json({ msg: "No chat found" });

    const message = chat.messages.id(messageId);
    if (!message) return res.status(404).json({ msg: "Message not found" });

    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    if (messageAge > 30000)
      return res.status(400).json({ msg: "Editing time expired" });

    message.text = newText;
    await chat.save();

    res.json({ msg: "Message updated successfully" });
  } catch (error) {
    console.error("Error editing message:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  const { messageId } = req.body;
  const userId = req.user.id;

  try {
    let chat = await Chat.findOne({ userId });
    if (!chat) return res.status(404).json({ msg: "No chat found" });

    const message = chat.messages.id(messageId);
    if (!message) return res.status(404).json({ msg: "Message not found" });

    // Use the pull method to remove the message from the array
    chat.messages.pull({ _id: messageId });
    await chat.save();

    res.json({ msg: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Fetch chat messages
exports.fetchChatMessages = async (req, res) => {
  const userId = req.user.id;

  try {
    if (!userId) return res.status(400).json({ msg: "Invalid user ID" });

    const chat = await Chat.findOne({ userId }).populate("adminId");
    if (!chat) return res.status(404).json({ msg: "No chat found" });

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (chat.lastActive < twentyFourHoursAgo && chat.messages.length === 0) {
      return res.json({ messages: [] });
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
  const userId = req.user.id;
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

exports.getUserChats = async (req, res) => {
  const userId = req.params.userId;
  try {
    const userChats = await Chat.findOne(userId)
      .sort({ lastActive: -1 })
      .populate('userId', 'firstName lastName profilePicture');

    res.json(userChats);
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Fetch chat details for a specific user
exports.fetchChatDetails = async (req, res) => {
  const userId = req.params.userId;

  try {
      const chat = await Chat.findOne({ userId }).populate('adminId');
      if (!chat) return res.status(404).json({ msg: "No chat found" });

      res.json(chat.messages);
  } catch (error) {
      console.error("Error fetching chat details:", error);
      res.status(500).json({ error: "Server error" });
  }
};

