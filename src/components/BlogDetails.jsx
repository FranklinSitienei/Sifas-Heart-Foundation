import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineLike, AiFillLike } from 'react-icons/ai';
import '../css/BlogDetails.css'

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  useEffect(() => {
    // Fetch blog details and comments
    const fetchBlogDetails = async () => {
      try {
        const response = await axios.get(`/api/blogs/${id}`);
        setBlog(response.data.blog);
        setComments(response.data.comments);
      } catch (error) {
        console.error('Error fetching blog details:', error);
      }
    };

    fetchBlogDetails();
  }, [id]);

  const handleLikeToggle = async () => {
    try {
      await axios.post(`/api/blogs/${id}/like`);
      setBlog((prevBlog) => ({
        ...prevBlog,
        isLiked: !prevBlog.isLiked,
        likeCount: prevBlog.isLiked ? prevBlog.likeCount - 1 : prevBlog.likeCount + 1,
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentSubmit = async () => {
    try {
      const response = await axios.post(`/api/blogs/${id}/comments`, { text: newComment });
      setComments((prevComments) => [...prevComments, response.data.comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  return (
    <div className="blog-details-container">
      {blog && (
        <>
          <div className="blog-details-header">
            <h1>{blog.title}</h1>
            <img src={blog.imageUrl} alt={blog.title} className="blog-details-image" />
          </div>
          <div className="blog-details-content">
            <p>{blog.description}</p>
            <div className="blog-details-actions">
              <span onClick={handleLikeToggle}>
                {blog.isLiked ? <AiFillLike className="like-icon liked" /> : <AiOutlineLike className="like-icon" />}
              </span>
              <span>{blog.likeCount} Likes</span>
              <span>{new Date(blog.createdAt).toLocaleDateString()} {new Date(blog.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="comments-section">
            <h2>Comments</h2>
            {comments.map((comment) => (
              <div className="comment" key={comment._id}>
                <div className="comment-header">
                  {comment.user.isAdmin ? (
                    <div className="admin-info">
                      <img src="/admin-profile.png" alt="Admin" className="admin-avatar" />
                      <span className="admin-name">Admin</span>
                    </div>
                  ) : (
                    <span className="comment-user">{comment.user.name}</span>
                  )}
                </div>
                <p>{comment.text}</p>
              </div>
            ))}
            <div className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
              />
              <button onClick={handleCommentSubmit}>Post Comment</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BlogDetails;
