import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaRegThumbsUp, FaThumbsUp } from 'react-icons/fa';
import { IoChatboxOutline } from "react-icons/io5";
import { MdVerified } from "react-icons/md";
import { formatDistanceToNow } from 'date-fns';
import '../css/allBlogs.css';

const AllBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [likedBlogs, setLikedBlogs] = useState(new Set());
    const token = localStorage.getItem("admin");

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch('https://sifas-heart-foundation.onrender.com/api/blog/all');
                const data = await response.json();
                setBlogs(data);
                const storedLikes = new Set(JSON.parse(localStorage.getItem("likedBlogs")) || []);
                setLikedBlogs(storedLikes);
            } catch (error) {
                console.error('Error fetching blogs:', error);
            }
        };

        fetchBlogs();
    }, []);

    const handleLike = async (blogId) => {
        try {
            await fetch(`https://sifas-heart-foundation.onrender.com/api/blog/admin/${blogId}/like`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setBlogs((prevBlogs) =>
                prevBlogs.map((blog) =>
                    blog._id === blogId
                        ? { ...blog, likeCount: blog.likeCount + 1, liked: true }
                        : blog
                )
            );

            const updatedLikes = new Set(likedBlogs);
            updatedLikes.add(blogId);
            setLikedBlogs(updatedLikes);
            localStorage.setItem("likedBlogs", JSON.stringify(Array.from(updatedLikes)));
        } catch (error) {
            console.error('Error liking blog:', error);
        }
    };

    const renderEmbeddedMedia = (url) => {
        // Check the URL and return an iframe based on the platform
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            return (
                <iframe
                    src={`https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0]}`}
                    title="YouTube video"
                    className="video"
                    allowFullScreen
                />
            );
        } else if (url.includes('tiktok.com')) {
            return (
                <iframe
                    src={url.replace('tiktok.com', 't.tiktok.com')}
                    title="TikTok video"
                    className="video"
                    allowFullScreen
                />
            );
        } else if (url.includes('twitter.com')) {
            return (
                <blockquote className="twitter-tweet">
                    <a href={url}>View Tweet</a>
                </blockquote>
            );
        } else if (url.includes('instagram.com')) {
            return (
                <iframe
                    src={`https://instagram.com/p/${url.split('/p/')[1]}/embed`}
                    title="Instagram post"
                    className="video"
                    allowFullScreen
                />
            );
        } else if (url.includes('gofundme.com')) {
            return (
                <iframe
                    src={url}
                    title="GoFundMe"
                    className="video"
                    allowFullScreen
                />
            );
        }
        return null; // Default case
    };

    return (
        <div className="all-blogs-container">
            <Link to="/create-blog" className="create-blog-button">
                <FaPlus size={24} />
            </Link>
            <h1 className="title">All Blogs</h1>
            <div className="blogs-grid">
                {blogs.map((blog) => (
                    <div key={blog._id} className="blog-card">
                        <div className="admin-info">
                            <img
                                src={blog.admin.profilePicture}
                                alt={`${blog.admin.firstName} ${blog.admin.lastName}`}
                                className="admin-profile"
                            />
                            <div>
                                <span className="admin-name">
                                    {blog.admin.firstName} {blog.admin.lastName}
                                    <span className="verified-tick">
                                        <MdVerified />
                                    </span>
                                </span>
                                <p className="date">
                                    {formatDistanceToNow(new Date(blog.date), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                        {blog.image && <img src={blog.image} alt={blog.title} className="media" />}
                        {blog.video && renderEmbeddedMedia(blog.video)}
                        <div className="blog-footer">
                            <div className="blog-actions">
                                <span
                                    className={`likes ${likedBlogs.has(blog._id) ? "liked" : ""}`}
                                    onClick={() => handleLike(blog._id)}
                                >
                                    {likedBlogs.has(blog._id) ? <FaThumbsUp color="blue" /> : <FaRegThumbsUp />}
                                    {blog.likeCount}
                                </span>
                                <Link to={`/blog/${blog._id}`} className="comments">
                                    <IoChatboxOutline /> {blog.commentCount}
                                </Link>
                            </div>
                        </div>
                        <h2 className="blog-title">{blog.title}</h2>
                        <p className="blog-content">{blog.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllBlogs;
