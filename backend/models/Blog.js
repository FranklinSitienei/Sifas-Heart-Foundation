const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReplySchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  content: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likeCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  mentions: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],
  reported: { type: Boolean, default: false }
}, { _id: true });

const CommentSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  content: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likeCount: { type: Number, default: 0 },
  mentions: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],
  replies: [ReplySchema],
  createdAt: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false }
}, { _id: true });

const BlogSchema = new Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  author: { type: String, default: "Sifa's Heart Foundation" },
  verified: { type: Boolean, default: true },
  category: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  video: { type: String },
  tags: [{ type: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  comments: [CommentSchema],
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Blog", BlogSchema);
