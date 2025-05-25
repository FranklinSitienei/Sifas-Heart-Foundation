const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderType: { type: String, enum: ['user', 'admin'], required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'senderType' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
  text: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'seen'],
    default: 'sent'
  }  
});

module.exports = mongoose.model('Message', messageSchema);
