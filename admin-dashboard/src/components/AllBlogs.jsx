import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaRegThumbsUp, FaComment } from 'react-icons/fa';
import { MdVerified } from "react-icons/md";
import '../css/allBlogs.css';

const AllBlogs = () => {
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch('https://sifas-heart-foundation-1.onrender.com/api/blog/all');
                const data = await response.json();
                setBlogs(data);
            } catch (error) {
                console.error('Error fetching blogs:', error);
            }
        };

        fetchBlogs();
    }, []);

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
            <h1>All Blogs</h1>
            <div className="blogs-grid">
                {blogs.map(blog => (
                    <div key={blog._id} className="blog-card">
                        <div className="admin-info">
                            <img 
                                src={blog.admin.profilePicture} 
                                alt={`${blog.admin.firstName} ${blog.admin.lastName}`} 
                                className="admin-profile" 
                            />
                            <span className="admin-name">
                                {blog.admin.firstName} {blog.admin.lastName}
                                <span className="verified-tick"><MdVerified /></span>
                            </span>
                        </div>
                        <h2 className="blog-title">{blog.title}</h2>
                        <p className="blog-content">{blog.content}</p>
                        {blog.image && (
                            <div className="media-container">
                                <img src={blog.image} alt={blog.title} className="media" />
                                <button className="donate-button">Donate</button>
                            </div>
                        )}
                        {blog.video && (
                            <div className="media-container">
                                {renderEmbeddedMedia(blog.video)}
                                <button className="donate-button">Donate</button>
                            </div>
                        )}
                        <div className="blog-footer">
                            <span className="date">{new Date(blog.date).toLocaleString()}</span>
                            <div className="blog-actions">
                                <span className="likes">
                                    <FaRegThumbsUp /> {blog.likes.length}
                                </span>
                                <Link to={`/blog/${blog._id}`} className="comments">
                                    <FaComment /> {blog.comments.length}
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllBlogs;
