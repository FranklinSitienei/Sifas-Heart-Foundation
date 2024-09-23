const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  replies: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      content: { type: String },
      date: { type: Date, default: Date.now },
    },
  ],
  date: { type: Date, default: Date.now },
});

const BlogSchema = new Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String }, // URL or path for images uploaded via multer
  video: { type: String }, // URL or path for videos uploaded via multer
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [CommentSchema],
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Blog", BlogSchema);
