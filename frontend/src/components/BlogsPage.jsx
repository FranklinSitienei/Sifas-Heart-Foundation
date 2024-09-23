import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './BlogsPage.css'; // Custom CSS for styling

const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    // Fetch blog posts from backend API
    fetch('https://sifas-heart-foundation-2.onrender.com/api/blogs')
      .then(response => response.json())
      .then(data => setBlogs(data))
      .catch(error => console.error('Error fetching blogs:', error));
  }, []);

  const handleLike = (id) => {
    // Handle like/unlike functionality here
  };

  return (
    <div className="blogs-container">
      {blogs.map(blog => (
        <div key={blog.id} className="blog-card">
          <img src={blog.imageUrl} alt={blog.title} className="blog-image" />
          <div className="blog-content">
            <h2 className="blog-title">{blog.title}</h2>
            <p className="blog-description">{blog.description}</p>
            <Link to="/donations" className="donate-link">Donate</Link>
            <div className="blog-actions">
              <span onClick={() => handleLike(blog.id)}>
                {blog.isLiked ? <FaHeart style={{ color: 'red' }} /> : <FaRegHeart />}
              </span>
              <span>{blog.createdAt}</span> {/* Timestamp */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogsPage;
