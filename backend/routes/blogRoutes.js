const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Store file in memory for processing

// Create a new blog (Admin only)
router.post('/create', [authMiddleware, adminMiddleware, upload.single('media')], async (req, res) => {
    const { title, content } = req.body;

    try {
        let mediaFile = req.file;
        let mediaPath = '';

        // Process uploaded media (image or video)
        if (mediaFile) {
            const base64Data = mediaFile.buffer.toString('base64');
            mediaPath = `data:${mediaFile.mimetype};base64,${base64Data}`;
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

module.exports = router;
