import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineLike, AiFillLike } from 'react-icons/ai';
import { MdVerified } from "react-icons/md";
import axios from 'axios';
import '../css/BlogsPage.css';

const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/blog/all');
        setBlogs(response.data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };

    fetchBlogs();
  }, []);

  const truncateText = (text, limit) => {
    return text.length > limit ? `${text.substring(0, limit)}...` : text;
  };

  const handleLikeToggle = async (blogId) => {
    try {
      await axios.post(`http://localhost:5000/api/blogs/${blogId}/like`);
      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog._id === blogId
            ? { ...blog, isLiked: !blog.isLiked, likeCount: blog.isLiked ? blog.likeCount - 1 : blog.likeCount + 1 }
            : blog
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const renderMedia = (blog) => {
    if (blog.video) {
      // Use specialized logic to handle different media URLs
      if (blog.video.includes('youtube.com')) {
        return (
          <iframe
            className="blog-video"
            src={`https://www.youtube.com/embed/${new URL(blog.video).searchParams.get('v')}`}
            title={blog.title}
            allowFullScreen
          ></iframe>
        );
      } else if (blog.video.includes('tiktok.com')) {
        // TikTok embed
        return (
          <blockquote className="tiktok-embed">
            <a href={blog.video} target="_blank" rel="noopener noreferrer">
              Watch on TikTok
            </a>
          </blockquote>
        );
      } else {
        // Redirect to unsupported media types like Twitter, GoFundMe
        return (
          <a href={blog.video} target="_blank" rel="noopener noreferrer">
            Watch Video
          </a>
        );
      }
    }

    if (blog.image) {
      return (
        <div className="image-container">
          <img src={blog.image} alt={blog.title} className="blog-image" />
          <div className="image-overlay">
            <Link to="/donations" className="donate-button">Donate</Link>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="blogs-container">
      {blogs.map((blog) => (
        <div className="blog-card" key={blog._id}>
          <div className="admin-info">
            <img src={blog.admin.profileImage} alt={`${blog.admin.firstName} ${blog.admin.lastName}`} className="admin-image" />
            <div className="admin-name">
              {blog.admin.firstName} {blog.admin.lastName} <span className="verified-tick"><MdVerified /></span>
            </div>
          </div>
          
          {/* Render image or video */}
          {renderMedia(blog)}
          
          <div className="blog-content">
            <h2>{blog.title}</h2>
            <p>{truncateText(blog.content, 100)}</p>
            <Link to={`/blogs/${blog._id}`}>Show more</Link>
          </div>
          <div className="blog-footer">
            <div className="blog-actions">
              <span onClick={() => handleLikeToggle(blog._id)}>
                {blog.isLiked ? <AiFillLike className="like-icon liked" /> : <AiOutlineLike className="like-icon" />}
              </span>
              <span>{blog.likeCount}</span>
              <span className="comment-icon">💬 {blog.comments.length}</span>
            </div>
            <div className="blog-date">
              {new Date(blog.createdAt).toLocaleDateString()} {new Date(blog.createdAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogsPage;
