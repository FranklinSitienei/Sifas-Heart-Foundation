import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaRegThumbsUp, FaComment } from 'react-icons/fa';
import '../css/allBlogs.css';

const AllBlogs = () => {
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch('/api/blogs/all');
                const data = await response.json();
                setBlogs(data);
            } catch (error) {
                console.error('Error fetching blogs:', error);
            }
        };

        fetchBlogs();
    }, []);

    return (
        <div className="all-blogs-container">
            <Link to="/create" className="create-blog-button">
                <FaPlus size={24} />
            </Link>
            <h1>All Blogs</h1>
            <div className="blogs-grid">
                {blogs.map(blog => (
                    <div key={blog._id} className="blog-card">
                        <div className="admin-info">
                            <img src={blog.admin.profileImage} alt={`${blog.admin.firstName} ${blog.admin.lastName}`} className="admin-profile" />
                            <span className="admin-name">
                                {blog.admin.firstName} {blog.admin.lastName}
                                <span className="verified-tick">✔️</span>
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
                                <iframe 
                                    src={blog.video} 
                                    title={blog.title} 
                                    className="video" 
                                    allowFullScreen 
                                />
                                <button className="donate-button">Donate</button>
                            </div>
                        )}
                        <div className="blog-footer">
                            <span className="date">{new Date(blog.date).toLocaleString()}</span>
                            <div className="blog-actions">
                                <span className="likes">
                                    <FaRegThumbsUp /> {blog.likes.length}
                                </span>
                                <span className="comments">
                                    <FaComment /> {blog.comments.length}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllBlogs;
