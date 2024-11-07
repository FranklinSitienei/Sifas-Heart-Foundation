import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaPlus, FaRegThumbsUp, FaThumbsUp } from 'react-icons/fa';
import { IoChatboxOutline } from "react-icons/io5";
import { MdVerified } from "react-icons/md";
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import '../css/BlogsPage.css';

const BlogsPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [likedBlogs, setLikedBlogs] = useState(new Set());
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch('https://sifas-heart-foundation-1.onrender.com/api/blog/all');
                const data = await response.json();
                setBlogs(data);
                
                // Set initial liked blogs from localStorage
                const storedLikes = JSON.parse(localStorage.getItem('likedBlogs')) || {};
                setLikedBlogs(new Set(Object.keys(storedLikes)));
            } catch (error) {
                console.error('Error fetching blogs:', error);
            }
        };
        fetchBlogs();
    }, []);

    const handleLike = async (blogId) => {
        try {
            const response = await axios.post(
                `https://sifas-heart-foundation-1.onrender.com/api/blog/user/${blogId}/like`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const isLiked = likedBlogs.has(blogId);
            const updatedLikeCount = isLiked 
                ? blogs.find(blog => blog._id === blogId).likeCount - 1 
                : blogs.find(blog => blog._id === blogId).likeCount + 1;

            // Update the blog's like status and count in the state
            setBlogs(prevBlogs =>
                prevBlogs.map(blog =>
                    blog._id === blogId
                        ? { ...blog, likeCount: updatedLikeCount }
                        : blog
                )
            );

            // Toggle liked status in the likedBlogs set
            const updatedLikes = new Set(likedBlogs);
            if (isLiked) {
                updatedLikes.delete(blogId);
            } else {
                updatedLikes.add(blogId);
            }
            setLikedBlogs(updatedLikes);

            // Update localStorage for blog likes
            const storedLikes = JSON.parse(localStorage.getItem('likedBlogs')) || {};
            if (updatedLikes.has(blogId)) {
                storedLikes[blogId] = true; // Mark as liked
            } else {
                delete storedLikes[blogId]; // Remove from liked
            }
            localStorage.setItem('likedBlogs', JSON.stringify(storedLikes));
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const renderEmbeddedMedia = (url) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            return <iframe src={`https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0]}`} title="YouTube video" className="video" allowFullScreen />;
        } else if (url.includes('tiktok.com')) {
            return <iframe src={url.replace('tiktok.com', 't.tiktok.com')} title="TikTok video" className="video" allowFullScreen />;
        } else if (url.includes('twitter.com')) {
            return <blockquote className="twitter-tweet"><a href={url}>View Tweet</a></blockquote>;
        } else if (url.includes('instagram.com')) {
            return <iframe src={`https://instagram.com/p/${url.split('/p/')[1]}/embed`} title="Instagram post" className="video" allowFullScreen />;
        } else if (url.includes('gofundme.com')) {
            return <iframe src={url} title="GoFundMe" className="video" allowFullScreen />;
        }
        return null; // Default case
    };

    return (
        <div className="all-blogs-container">
            <h1 className='title'>All Blogs</h1>
            <div className="blogs-grid">
                {blogs.map(blog => (
                    <div key={blog._id} className="blog-card">
                        <div className="admin-info">
                            <img src={blog.admin.profilePicture} alt={`${blog.admin.firstName} ${blog.admin.lastName}`} className="admin-profile" />
                            <div>
                                <span className="admin-name">
                                    {blog.admin.firstName} {blog.admin.lastName}
                                    <span className="verified-tick"><MdVerified /></span>
                                </span>
                                <p className="date">{formatDistanceToNow(new Date(blog.date), { addSuffix: true })}</p>
                            </div>
                        </div>
                        {blog.image && (
                            <div className="media-container">
                                <img src={blog.image} alt={blog.title} className="media" />
                                <button className="donate-button"><Link to="/donations">Donate</Link></button>
                            </div>
                        )}
                        {blog.video && (
                            <div className="media-container">
                                {renderEmbeddedMedia(blog.video)}
                                <button className="donate-button">Donate</button>
                            </div>
                        )}
                        <h2 className="blog-title">{blog.title}</h2>
                        <p className="blog-content">{blog.content}</p>
                        <div className="blog-footer">
                            <div className="blog-actions">
                                <span
                                    className="likes"
                                    onClick={() => handleLike(blog._id)}
                                    style={{ color: likedBlogs.has(blog._id) ? 'blue' : 'initial' }}
                                >
                                    {likedBlogs.has(blog._id) ? <FaThumbsUp /> : <FaRegThumbsUp />}
                                    {blog.likeCount}
                                </span>
                                <Link to={`/blog/${blog._id}`} className="comments">
                                    <IoChatboxOutline /> {blog.comments.commentCount}
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlogsPage;
