// routes/blogRoutes.js
const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const User = require("../models/User");
const Admin = require("../models/Admin");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/adminMiddleware");

// Define the maximum media size (e.g., 16 MB)
const MAX_MEDIA_SIZE = 16 * 1024 * 1024; // 16 MB

// View all blogs (Public or authenticated users based on your requirement)
router.get("/all", async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("admin", "firstName lastName profilePicture")
      .populate("comments.user", "firstName lastName profilePicture")
      .populate("comments.replies.user", "firstName lastName profilePicture");
    res.status(200).json(blogs);
  } catch (err) {
    console.error("Error fetching all blogs:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// View a single blog by ID (Public or authenticated users based on your requirement)
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("comments.admin", "firstName lastName profilePicture")
      .populate("comments.user", "firstName lastName profilePicture")
      .populate("comments.replies.user", "firstName lastName profilePicture")
      .populate("comments.replies.admin", "firstName lastName profilePicture");;

      console.log("Fetched Blog Data:", blog);

    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json(blog);
  } catch (err) {
    console.error("Error fetching blog details:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

/* Admin Routes */

// Create a new blog (Admin only)
router.post(
  "/admin/create",
  [adminMiddleware, upload.single("media")],
  async (req, res) => {
    const { title, content, mediaUrl, tags } = req.body;

    try {
      let mediaPath = "";

      // Check if a media file was uploaded
      if (req.file) {
        // Ensure the file size is within limits
        if (req.file.size > MAX_MEDIA_SIZE) {
          return res
            .status(400)
            .json({ message: "File size exceeds 16 MB limit" });
        }

        const base64Data = req.file.buffer.toString("base64");
        mediaPath = `data:${req.file.mimetype};base64,${base64Data}`;
      } else if (mediaUrl) {
        // Check if a media URL is provided
        mediaPath = mediaUrl;
      }

      const newBlog = new Blog({
        admin: req.admin.id, // Admin's ID
        title,
        content,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
        image: mediaPath.includes("image") ? mediaPath : "",
        video: mediaPath.includes("video") ? mediaPath : "",
      });

      await newBlog.save();
      res
        .status(201)
        .json({ message: "Blog created successfully", blog: newBlog });
    } catch (err) {
      console.error("Error details:", err);
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

// Edit a blog (Admin only)
router.put("/admin/:id/edit", adminMiddleware, async (req, res) => {
  const { title, content, tags } = req.body;

  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (req.admin.id !== blog.admin.toString()) {
      return res
        .status(403)
        .json({ message: "Forbidden: Only the admin can edit this blog" });
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.tags = tags ? tags.split(",").map((tag) => tag.trim()) : blog.tags;

    await blog.save();
    res.status(200).json({ message: "Blog updated", blog });
  } catch (err) {
    console.error("Error editing blog:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Delete a blog (Admin only)
router.delete("/admin/:id/delete", adminMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (req.admin.id !== blog.admin.toString()) {
      return res
        .status(403)
        .json({ message: "Forbidden: Only the admin can delete this blog" });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Admin can add a comment on a blog
router.post('/admin/:blogId/comment', adminMiddleware, async (req, res) => {
  const { content } = req.body;

  const mentionRegex = /@(\w+)/g; // Regex for mentions
  const mentions = [...content.matchAll(mentionRegex)].map(match => match[1]);

  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Find mentioned users
    const mentionedUsers = await User.find({
      $or: mentions.map(mention => ({
        firstName: { $regex: mention, $options: 'i' },
        lastName: { $regex: mention, $options: 'i' },
      })),
    });

    const newComment = {
      user: req.admin.id, // Changed to req.admin.id
      content,
      mentions: mentionedUsers.map(user => user._id), // Store IDs of mentioned users
    };

    blog.comments.push(newComment);
    await blog.save();

    res.status(201).json(newComment);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Admin can reply to a comment
router.post('/admin/:blogId/comment/:commentId/reply', adminMiddleware, async (req, res) => {
  const { blogId, commentId } = req.params;
  const { content } = req.body;

  const mentionRegex = /@(\w+)/g; // Regex for mentions
  const mentions = [...content.matchAll(mentionRegex)].map(match => match[1]);

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found." });

    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found." });

    // Find mentioned users
    const mentionedUsers = await User.find({
      $or: mentions.map(mention => ({
        firstName: { $regex: mention, $options: 'i' },
        lastName: { $regex: mention, $options: 'i' },
      })),
    });

    const reply = {
      user: req.admin.id, // Changed to req.admin.id
      content,
      mentions: mentionedUsers.map(user => user._id), // Store IDs of mentioned users
      createdAt: new Date(),
    };

    comment.replies.push(reply);
    await blog.save();

    res.status(201).json(reply);
  } catch (error) {
    console.error('Error replying to comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin can delete any reported comment
router.delete('/admin/:blogId/comment/:commentId/delete', adminMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Check if the comment is reported
    if (!comment.reported) {
      return res.status(400).json({ message: "Comment is not reported" });
    }

    comment.remove();
    await blog.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Admin can edit any comment
router.put('/admin/:blogId/comment/:commentId/edit', adminMiddleware, async (req, res) => {
  const { content } = req.body;

  try {
    const { blogId, commentId } = req.params;
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.content = content || comment.content; // Update content
    await blog.save();

    res.status(200).json({ message: "Comment edited successfully", comment });
  } catch (err) {
    console.error("Error editing comment:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Admin can delete any reported reply
router.delete('/admin/:blogId/comment/:commentId/reply/:replyId/delete', adminMiddleware, async (req, res) => {
  try {
    const { blogId, commentId, replyId } = req.params;
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    // Check if the reply is reported
    if (!reply.reported) {
      return res.status(400).json({ message: "Reply is not reported" });
    }

    reply.remove();
    await blog.save();

    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (err) {
    console.error("Error deleting reply:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Admin can edit any reply
router.put('/admin/:blogId/comment/:commentId/reply/:replyId/edit', adminMiddleware, async (req, res) => {
  const { content } = req.body;

  try {
    const { blogId, commentId, replyId } = req.params;
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    reply.content = content || reply.content; // Update content
    await blog.save();

    res.status(200).json({ message: "Reply edited successfully", reply });
  } catch (err) {
    console.error("Error editing reply:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Like a comment (Admin) 
router.post("/admin/:blogId/comment/:commentId/like", adminMiddleware, async (req, res) => {
  try {
    const { blogId, commentId } = req.params;

    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Check if the admin already liked the comment
    if (comment.likes.includes(req.admin.id)) { // Changed to req.admin.id
      return res.status(400).json({ message: "Already liked this comment" });
    }

    // Use findOneAndUpdate to update the likes array directly
    await Blog.findOneAndUpdate(
      { _id: blogId, "comments._id": commentId },
      { $addToSet: { "comments.$.likes": req.admin.id } }, // Use $addToSet to prevent duplicates
      { new: true }
    );

    res.status(200).json({ message: "Comment liked", likeCount: comment.likes.length + 1 });
  } catch (err) {
    console.error("Error liking comment:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Unlike a comment (Admin)
router.post("/admin/:blogId/comment/:commentId/unlike", adminMiddleware, async (req, res) => {
  try {
    const { blogId, commentId } = req.params;

    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (!comment.likes.includes(req.admin.id)) { // Changed to req.admin.id
      return res.status(400).json({ message: "You haven't liked this comment" });
    }

    // Use findOneAndUpdate to update the likes array directly
    await Blog.findOneAndUpdate(
      { _id: blogId, "comments._id": commentId },
      { $pull: { "comments.$.likes": req.admin.id } }, // Use $pull to remove the like
      { new: true }
    );

    res.status(200).json({ message: "Comment unliked", likeCount: comment.likes.length - 1 });
  } catch (err) {
    console.error("Error unliking comment:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Like a reply (Admin)
router.post("/admin/:blogId/comment/:commentId/reply/:replyId/like", adminMiddleware, async (req, res) => {
  try {
    const { blogId, commentId, replyId } = req.params;

    // Fetch the blog with all comments and replies
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Find the comment
    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Find the reply
    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    // Check if the admin already liked the reply
    if (reply.likes.includes(req.admin.id)) { // Changed to req.admin.id
      return res.status(400).json({ message: "Already liked this reply" });
    }

    // Add the user's ID to the likes array of the reply
    reply.likes.push(req.admin.id);

    // Save the blog document
    await blog.save();

    res.status(200).json({ message: "Reply liked", likeCount: reply.likes.length });
  } catch (err) {
    console.error("Error liking reply:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Unlike a reply (Admin)
router.post("/admin/:blogId/comment/:commentId/reply/:replyId/unlike", adminMiddleware, async (req, res) => {
  try {
    const { blogId, commentId, replyId } = req.params;

    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    if (!reply.likes.includes(req.admin.id)) { // Changed to req.admin.id
      return res.status(400).json({ message: "You haven't liked this reply" });
    }

    // Use findOneAndUpdate to update the likes array directly
    await Blog.findOneAndUpdate(
      { _id: blogId, "comments._id": commentId, "comments.replies._id": replyId },
      { $pull: { "comments.$.replies.$.likes": req.admin.id } }, // Use $pull to remove the like
      { new: true }
    );

    res.status(200).json({ message: "Reply unliked", likeCount: reply.likes.length - 1 });
  } catch (err) {
    console.error("Error unliking reply:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Admin can delete any reported comment or reply
router.delete(
  "/admin/:blogId/comment/:commentId/delete",
  adminMiddleware,
  async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.blogId);
      if (!blog) return res.status(404).json({ message: "Blog not found" });

      const comment = blog.comments.id(req.params.commentId);
      if (!comment)
        return res.status(404).json({ message: "Comment not found" });

      // Assuming you have a 'reported' flag on comments
      if (!comment.reported) {
        return res.status(400).json({ message: "Comment is not reported" });
      }

      comment.remove();
      await blog.save();

      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err) {
      console.error("Error deleting comment:", err);
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

// Admin can delete a reply
router.delete(
  "/admin/:blogId/comment/:commentId/reply/:replyId/delete",
  adminMiddleware,
  async (req, res) => {
    try {
      const { blogId, commentId, replyId } = req.params;
      const blog = await Blog.findById(blogId);
      if (!blog) return res.status(404).json({ message: "Blog not found" });

      const comment = blog.comments.id(commentId);
      if (!comment)
        return res.status(404).json({ message: "Comment not found" });

      const reply = comment.replies.id(replyId);
      if (!reply) return res.status(404).json({ message: "Reply not found" });

      // Assuming you have a 'reported' flag on replies
      if (!reply.reported) {
        return res.status(400).json({ message: "Reply is not reported" });
      }

      reply.remove();
      await blog.save();

      res.status(200).json({ message: "Reply deleted successfully" });
    } catch (err) {
      console.error("Error deleting reply:", err);
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

// Admin can edit their own comments
router.put(
  "/admin/:blogId/comment/:commentId/edit",
  adminMiddleware,
  async (req, res) => {
    const { content } = req.body;

    try {
      const { blogId, commentId } = req.params;
      const blog = await Blog.findById(blogId);
      if (!blog) return res.status(404).json({ message: "Blog not found" });

      const comment = blog.comments.id(commentId);
      if (!comment)
        return res.status(404).json({ message: "Comment not found" });

      // Only allow admin to edit their own comments
      if (comment.admin.toString() !== req.admin.id) {
        return res
          .status(403)
          .json({ message: "Forbidden: Can only edit your own comments" });
      }

      comment.content = content || comment.content;
      await blog.save();

      res.status(200).json({ message: "Comment edited successfully", comment });
    } catch (err) {
      console.error("Error editing comment:", err);
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

// Like a blog (Admin)
router.post("/admin/blog/:blogId/like", adminMiddleware, async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Check if the admin already liked the blog
    if (blog.likes.includes(req.admin.id)) { // Changed to req.admin.id
      return res.status(400).json({ message: "Already liked this blog" });
    }

    // Use findOneAndUpdate to update the likes array directly
    await Blog.findOneAndUpdate(
      { _id: blogId },
      { $addToSet: { likes: req.admin.id } }, // Use $addToSet to prevent duplicates
      { new: true }
    );

    res.status(200).json({ message: "Blog liked", likeCount: blog.likes.length + 1 });
  } catch (err) {
    console.error("Error liking blog:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Unlike a blog (Admin)
router.post("/admin/blog/:blogId/unlike", adminMiddleware, async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Check if the admin already liked the blog
    if (!blog.likes.includes(req.admin.id)) { // Changed to req.admin.id
      return res.status(400).json({ message: "You haven't liked this blog" });
    }

    // Use findOneAndUpdate to update the likes array directly
    await Blog.findOneAndUpdate(
      { _id: blogId },
      { $pull: { likes: req.admin.id } }, // Use $pull to remove the like
      { new: true }
    );

    res.status(200).json({ message: "Blog unliked", likeCount: blog.likes.length - 1 });
  } catch (err) {
    console.error("Error unliking blog:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

/* User Comment Routes */

// Comment on a blog (Users)
router.post("/user/:id/comment", authMiddleware, async (req, res) => {
  const { content } = req.body;

  // Use regex to find mentioned admins
  const mentionRegex = /@(\w+)/g; // Modify this regex based on your mention format
  const mentions = [...content.matchAll(mentionRegex)].map(match => match[1]);

  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Find mentioned admins
    const mentionedAdmins = await Admin.find({
      $or: mentions.map(mention => ({
        firstName: { $regex: mention, $options: 'i' },
        lastName: { $regex: mention, $options: 'i' },
      })),
    });

    const newComment = {
      user: req.user.id,
      content,
      mentions: mentionedAdmins.map(admin => admin._id), // Store the IDs of mentioned admins
    };

    blog.comments.push(newComment);
    await blog.save();

    res.status(201).json(newComment);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Route to search users by query for mentions
router.get('/users/search', async (req, res) => {
  const { query } = req.query;
  try {
    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
      ],
    }).select('firstName lastName _id'); // Select only necessary fields
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users for mentions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reply to a comment (Users)
router.post("/user/:blogId/comment/:commentId/reply", authMiddleware, async (req, res) => {
  const { blogId, commentId } = req.params;
  const { content } = req.body;

  const mentionRegex = /@(\w+)/g; // Modify this regex based on your mention format
  const mentions = [...content.matchAll(mentionRegex)].map(match => match[1]);

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found." });

    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found." });

    // Find mentioned admins
    const mentionedAdmins = await Admin.find({
      $or: mentions.map(mention => ({
        firstName: { $regex: mention, $options: 'i' },
        lastName: { $regex: mention, $options: 'i' },
      })),
    });

    const reply = {
      user: req.user.id,
      content,
      mentions: mentionedAdmins.map(admin => admin._id), // Store the IDs of mentioned admins
      createdAt: new Date(),
    };

    comment.replies.push(reply);
    await blog.save();

    res.status(201).json(reply);
  } catch (error) {
    console.error('Error replying to comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like a blog (Users)
router.post("/user/:id/like", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.likes.includes(req.user.id)) {
      return res.status(400).json({ message: "Already liked" });
    }

    blog.likes.push(req.user.id);
    await blog.save();

    res
      .status(200)
      .json({ message: "Blog liked", likeCount: blog.likes.length });
  } catch (err) {
    console.error("Error liking blog:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Unlike a blog (Users)
router.post("/user/:id/unlike", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.likes = blog.likes.filter(
      (like) => like.toString() !== req.user.id.toString()
    );
    await blog.save();

    res
      .status(200)
      .json({ message: "Blog unliked", likeCount: blog.likes.length });
  } catch (err) {
    console.error("Error unliking blog:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// User can delete their own comment
router.delete(
  "/user/:blogId/comment/:commentId/delete", authMiddleware,
  async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.blogId);
      if (!blog) return res.status(404).json({ message: "Blog not found" });

      const comment = blog.comments.id(req.params.commentId);
      if (!comment) return res.status(404).json({ message: "Comment not found" });

      // Check if the user is the owner of the comment
      if (comment.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Can only delete your own comments" });
      }

      comment.remove();
      await blog.save();

      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err) {
      console.error("Error deleting comment:", err);
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

// User can edit their own comment within 1 minute
router.put(
  "/user/:blogId/comment/:commentId/edit", authMiddleware,
  async (req, res) => {
    const { content } = req.body;

    try {
      const { blogId, commentId } = req.params;
      const blog = await Blog.findById(blogId);
      if (!blog) return res.status(404).json({ message: "Blog not found" });

      const comment = blog.comments.id(commentId);
      if (!comment) return res.status(404).json({ message: "Comment not found" });

      // Check if the user is the owner of the comment
      if (comment.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Can only edit your own comments" });
      }

      // Check if the comment was created within the last minute
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      if (new Date(comment.createdAt) < oneMinuteAgo) {
        return res.status(400).json({ message: "You can only edit your comment within 1 minute" });
      }

      comment.content = content || comment.content;
      await blog.save();

      res.status(200).json({ message: "Comment edited successfully", comment });
    } catch (err) {
      console.error("Error editing comment:", err);
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

// User can delete their own reply
router.delete(
  "/user/:blogId/comment/:commentId/reply/:replyId/delete", authMiddleware,
  async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.blogId);
      if (!blog) return res.status(404).json({ message: "Blog not found" });

      const comment = blog.comments.id(req.params.commentId);
      if (!comment) return res.status(404).json({ message: "Comment not found" });

      const reply = comment.replies.id(req.params.replyId);
      if (!reply) return res.status(404).json({ message: "Reply not found" });

      // Check if the user is the owner of the reply
      if (reply.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Can only delete your own replies" });
      }

      reply.remove();
      await blog.save();

      res.status(200).json({ message: "Reply deleted successfully" });
    } catch (err) {
      console.error("Error deleting reply:", err);
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

// User can edit their own reply within 1 minute
router.put(
  "/user/:blogId/comment/:commentId/reply/:replyId/edit", authMiddleware,
  async (req, res) => {
    const { content } = req.body;

    try {
      const { blogId, commentId, replyId } = req.params;
      const blog = await Blog.findById(blogId);
      if (!blog) return res.status(404).json({ message: "Blog not found" });

      const comment = blog.comments.id(commentId);
      if (!comment) return res.status(404).json({ message: "Comment not found" });

      const reply = comment.replies.id(replyId);
      if (!reply) return res.status(404).json({ message: "Reply not found" });

      // Check if the user is the owner of the reply
      if (reply.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Can only edit your own replies" });
      }

      // Check if the reply was created within the last minute
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      if (new Date(reply.createdAt) < oneMinuteAgo) {
        return res.status(400).json({ message: "You can only edit your reply within 1 minute" });
      }

      reply.content = content || reply.content;
      await blog.save();

      res.status(200).json({ message: "Reply edited successfully", reply });
    } catch (err) {
      console.error("Error editing reply:", err);
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

/* Like/Unlike Comment Routes */

// Like a comment (Users)
router.post("/user/:blogId/comment/:commentId/like", authMiddleware, async (req, res) => {
  try {
    const { blogId, commentId } = req.params;

    // Re-fetch the blog to get the latest version
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Check if the user already liked the comment
    if (comment.likes.includes(req.user.id)) {
      return res.status(400).json({ message: "Already liked this comment" });
    }

    // Add like and save
    comment.likes.push(req.user.id);
    await blog.save(); // This will now work with the latest document version

    res.status(200).json({ message: "Comment liked", likeCount: comment.likes.length });
  } catch (err) {
    console.error("Error liking comment:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Unlike a comment (Users)
router.post("/user/:blogId/comment/:commentId/unlike", authMiddleware, async (req, res) => {
  try {
    const { blogId, commentId } = req.params;
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (!comment.likes.includes(req.user.id)) {
      return res.status(400).json({ message: "You haven't liked this comment" });
    }

    comment.likes = comment.likes.filter(
      (like) => like.toString() !== req.user.id.toString()
    );
    await blog.save();

    res.status(200).json({ message: "Comment unliked", likeCount: comment.likes.length });
  } catch (err) {
    console.error("Error unliking comment:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Like a reply (Users)
router.post("/user/:blogId/comment/:commentId/reply/:replyId/like", authMiddleware, async (req, res) => {
  try {
    const { blogId, commentId, replyId } = req.params;
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    if (reply.likes.includes(req.user.id)) {
      return res.status(400).json({ message: "Already liked this reply" });
    }

    reply.likes.push(req.user.id);
    await blog.save();

    res.status(200).json({ message: "Reply liked", likeCount: reply.likes.length });
  } catch (err) {
    console.error("Error liking reply:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Unlike a reply (Users)
router.post("/user/:blogId/comment/:commentId/reply/:replyId/unlike", authMiddleware, async (req, res) => {
  try {
    const { blogId, commentId, replyId } = req.params;
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    if (!reply.likes.includes(req.user.id)) {
      return res.status(400).json({ message: "You haven't liked this reply" });
    }

    reply.likes = reply.likes.filter(
      (like) => like.toString() !== req.user.id.toString()
    );
    await blog.save();

    res.status(200).json({ message: "Reply unliked", likeCount: reply.likes.length });
  } catch (err) {
    console.error("Error unliking reply:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

/* Report Functionality */

// Report a comment (Users)
router.post("/:blogId/comment/:commentId/report", authMiddleware, async (req, res) => {
  try {
    const { blogId, commentId } = req.params;
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.reported = true;
    await blog.save();

    res.status(200).json({ message: "Comment reported successfully" });
  } catch (error) {
    console.error("Error reporting comment:", error);
    res.status(500).json({ message: "Error reporting comment", error });
  }
});

// Report a reply (Users)
router.post("/:blogId/comment/:commentId/reply/:replyId/report", authMiddleware, async (req, res) => {
  try {
    const { blogId, commentId, replyId } = req.params;
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    reply.reported = true;
    await blog.save();

    res.status(200).json({ message: "Reply reported successfully" });
  } catch (error) {
    console.error("Error reporting reply:", error);
    res.status(500).json({ message: "Error reporting reply", error });
  }
});

module.exports = router;
