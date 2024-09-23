import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import './BlogDetails.css'; // Custom CSS for styling

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    // Fetch blog details and comments by ID
    fetch(`https://sifas-heart-foundation-2.onrender.com/api/blogs/${id}`)
      .then(response => response.json())
      .then(data => {
        setBlog(data.blog);
        setComments(data.comments);
      })
      .catch(error => console.error('Error fetching blog details:', error));
  }, [id]);

  const handleReply = (commentId) => {
    // Handle reply functionality here
  };

  return (
    blog ? (
      <div className="blog-details-container">
        <h1>{blog.title}</h1>
        <img src={blog.imageUrl} alt={blog.title} className="blog-detail-image" />
        <p>{blog.description}</p>
        <div className="blog-likes">
          <span>{blog.likes} Likes</span>
        </div>
        <div className="blog-comments">
          <h2>Comments</h2>
          {comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <FaUserCircle className="comment-user-icon" />
              <div className="comment-content">
                <p>{comment.user}: {comment.text}</p>
                <span>{comment.createdAt}</span>
                {comment.isAdmin && <span className="admin-label">Admin</span>}
                <button onClick={() => handleReply(comment.id)}>Reply</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : <p>Loading...</p>
  );
};

export default BlogDetails;
