const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // For admin users
  content: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likeCount: { type: Number, default: 0 },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }],
  replies: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
      content: { type: String, required: true },
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' } || { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }],
      likeCount: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now },
      mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }|| { type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

const BlogSchema = new Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  video: { type: String }, 
  tags: [{ type: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  likeCount: { type: Number, default: 0 },
  comments: [CommentSchema],
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Blog", BlogSchema);
