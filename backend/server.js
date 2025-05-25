const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
require('dotenv').config();

// Models
const User = require('./models/User');
const Admin = require('./models/Admin');
const Message = require('./models/Message');

// DB Connect
const connectDB = require('./config/db');
connectDB();

// App and Middleware
const app = express();
const server = http.createServer(app);

app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session & Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admins', require('./routes/adminRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/webhooks', require('./routes/webhooks'));
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/notifications', require('./routes/notificationRoutes'));

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  const { id } = socket.user;

  onlineUsers.set(id, socket.id);

  const updatePresence = async (Model, isOnline) => {
    await Model.findByIdAndUpdate(id, {
      isOnline,
      lastSeen: new Date()
    });
    io.emit('userOnlineStatus', { userId: id, isOnline });
  };

  socket.on('register', async ({ role }) => {
    const Model = role === 'admin' ? Admin : User;
    await updatePresence(Model, true);
  });

  socket.on('typing', ({ fromId, toId, isTyping }) => {
    const toSocketId = onlineUsers.get(toId);
    if (toSocketId) {
      io.to(toSocketId).emit('typingStatus', { fromId, isTyping });
    }
  });

  socket.on('sendMessage', async ({ text, fromId, toId, fromRole }) => {
    const newMessage = await Message.create({
      senderType: fromRole,
      senderId: fromId,
      receiverId: toId,
      text,
      isRead: false,
      status: 'sent'
    });

    const toSocketId = onlineUsers.get(toId);
    if (toSocketId) {
      io.to(toSocketId).emit('newMessage', newMessage);
    }
  });

  socket.on('messageDelivered', async ({ messageId }) => {
    await Message.findByIdAndUpdate(messageId, { status: 'delivered' });
  });

  socket.on('messageSeen', async ({ messageId }) => {
    await Message.findByIdAndUpdate(messageId, { status: 'seen' });
  });

  socket.on('disconnect', async () => {
    onlineUsers.delete(id);
    await User.findByIdAndUpdate(id, { isOnline: false, lastSeen: new Date() });
    await Admin.findByIdAndUpdate(id, { isOnline: false, lastSeen: new Date() });
    io.emit('userOnlineStatus', { userId: id, isOnline: false });
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
