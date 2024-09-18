const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
  },
  messages: [{
    from: String,
    text: String,
    emoji: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isComplex: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
