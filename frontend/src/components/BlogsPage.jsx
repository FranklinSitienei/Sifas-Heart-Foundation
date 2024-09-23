import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineLike, AiFillLike } from 'react-icons/ai';
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
      await axios.post(`/api/blogs/${blogId}/like`);
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

  return (
    <div className="blogs-container">
      {blogs.map((blog) => (
        <div className="blog-card" key={blog._id}>
          {/* Check if the blog has a video or image */}
          {blog.video ? (
            <iframe
              className="blog-video"
              src={blog.video}
              title={blog.title}
              allowFullScreen
            ></iframe>
          ) : (
            <img src={blog.image} alt={blog.title} className="blog-image" />
          )}
          
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
            </div>
            <div className="blog-date">
              {new Date(blog.createdAt).toLocaleDateString()} {new Date(blog.createdAt).toLocaleTimeString()}
            </div>
            <Link to="/donations" className="donate-link">Donate</Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogsPage;
