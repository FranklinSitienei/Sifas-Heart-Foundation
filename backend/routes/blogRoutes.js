const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

// Define the maximum media size (e.g., 16 MB)
const MAX_MEDIA_SIZE = 16 * 1024 * 1024; // 16 MB

// Create a new blog (Admin only)
router.post('/create', [adminMiddleware, upload.single('media')], async (req, res) => {
    const { title, content, mediaUrl } = req.body;

    try {
        let mediaPath = '';

        // Check if a media file was uploaded
        if (req.file) {
            // Ensure the file size is within limits
            if (req.file.size > MAX_MEDIA_SIZE) {
                return res.status(400).json({ message: 'File size exceeds 16 MB limit' });
            }

            const base64Data = req.file.buffer.toString('base64');
            mediaPath = `data:${req.file.mimetype};base64,${base64Data}`;
        } else if (mediaUrl) {
            // Check if a media URL is provided
            mediaPath = mediaUrl;
        }

        const newBlog = new Blog({
            admin: req.user.id, // Admin's ID
            title,
            content,
            image: mediaPath.includes('image') ? mediaPath : '',
            video: mediaPath.includes('video') ? mediaPath : ''
        });

        await newBlog.save();
        res.status(201).json({ message: 'Blog created successfully', blog: newBlog });
    } catch (err) {
        console.error('Error details:', err);
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        res.status(500).json({ message: 'Server error', error: err });
    }
});

// View all blogs
router.get('/all', async (req, res) => {
    try {
        const blogs = await Blog.find().populate('admin', 'firstName lastName').populate('comments.user', 'firstName lastName');
        res.status(200).json(blogs);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

// View a single blog by ID
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('admin', 'firstName lastName')
            .populate('comments.user', 'firstName lastName')
            .populate('comments.replies.user', 'firstName lastName');
        
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        res.status(200).json(blog);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

// Comment on a blog (Users)
router.post('/:id/comment', authMiddleware, async (req, res) => {
    const { content } = req.body;

    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });

        blog.comments.push({ user: req.user.id, content });
        await blog.save();

        res.status(201).json({ message: 'Comment added', blog });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

// Reply to a comment (User or Admin)
router.post('/:blogId/comment/:commentId/reply', authMiddleware, async (req, res) => {
    const { content } = req.body;

    try {
        const blog = await Blog.findById(req.params.blogId);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });

        const comment = blog.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        comment.replies.push({ user: req.user.id, content });
        await blog.save();

        res.status(201).json({ message: 'Reply added', blog });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

// Like a blog (Users)
router.post('/:id/like', authMiddleware, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });

        if (blog.likes.includes(req.user.id)) {
            return res.status(400).json({ message: 'Already liked' });
        }

        blog.likes.push(req.user.id);
        await blog.save();

        res.status(200).json({ message: 'Blog liked', blog });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

// Unlike a blog (Users)
router.post('/:id/unlike', authMiddleware, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });

        blog.likes = blog.likes.filter(like => like.toString() !== req.user.id.toString());
        await blog.save();

        res.status(200).json({ message: 'Blog unliked', blog });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

// Edit a blog (Admin only)
router.put('/:id/edit', adminMiddleware, async (req, res) => {
    const { title, content } = req.body;

    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });

        if (req.user.id !== blog.admin.toString()) {
            return res.status(403).json({ message: 'Forbidden: Only the admin can edit this blog' });
        }

        blog.title = title || blog.title;
        blog.content = content || blog.content;

        await blog.save();
        res.status(200).json({ message: 'Blog updated', blog });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

module.exports = router;
