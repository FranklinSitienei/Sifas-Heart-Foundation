import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineLike, AiFillLike } from 'react-icons/ai';
import '../css/BlogDetails.css';

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
        setBlog(response.data);
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
      const response = await axios.post(`/api/blogs/${id}/comment`, { content: newComment });
      setComments((prevComments) => [...prevComments, response.data]);
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
            {/* Render image or video */}
            {blog.image ? (
              <img src={blog.image} alt={blog.title} className="blog-details-media" />
            ) : blog.video ? (
              <iframe
                src={blog.video}
                title={blog.title}
                frameBorder="0"
                allowFullScreen
                className="blog-details-media"
              ></iframe>
            ) : null}
          </div>
          <div className="blog-details-content">
            <p>{blog.content}</p>
            <div className="blog-details-actions">
              <span onClick={handleLikeToggle}>
                {blog.isLiked ? <AiFillLike className="like-icon liked" /> : <AiOutlineLike className="like-icon" />}
              </span>
              <span>{blog.likeCount} Likes</span>
              <span>{new Date(blog.date).toLocaleDateString()} {new Date(blog.date).toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="comments-section">
            <h2>Comments</h2>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div className="comment" key={comment._id}>
                  <div className="comment-header">
                    <span className="comment-user">{comment.user.firstName} {comment.user.lastName}</span>
                  </div>
                  <p>{comment.content}</p>
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="replies">
                      {comment.replies.map((reply) => (
                        <div className="reply" key={reply._id}>
                          <span className="reply-user">{reply.user.firstName} {reply.user.lastName}:</span>
                          <p>{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="no-comments">No comments. But You Be the first One!😉</p>
            )}

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
