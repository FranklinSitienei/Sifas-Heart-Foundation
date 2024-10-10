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
        admin: req.user.id, // Admin's ID
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

    if (req.user.id !== blog.admin.toString()) {
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

    if (req.user.id !== blog.admin.toString()) {
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

/* User Routes */

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
      .populate("admin", "firstName lastName profilePicture")
      .populate("comments.user", "firstName lastName profilePicture")
      .populate("comments.replies.user", "firstName lastName profilePicture");

    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json(blog);
  } catch (err) {
    console.error("Error fetching blog details:", err);
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

/* Admin Comment Routes */

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
      if (comment.user.toString() !== req.user.id) {
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
