import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { AiOutlineLike, AiFillLike, AiOutlineSend } from "react-icons/ai";
import { MdVerified } from "react-icons/md";
import "../css/AdminBlogDetails.css"; // Shared styles

const AdminBlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const token = localStorage.getItem("admin");

  useEffect(() => {
    if (token) {
      fetchBlogDetails();
    }
  }, [id, token]);

  const fetchBlogDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/blog/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBlog(response.data);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error("Error fetching blog details:", error.response?.data || error.message);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await axios.post(
        `http://localhost:5000/api/admin/blog/${id}/comment`,
        { content: newComment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments([...comments, response.data]);
      setNewComment("");
    } catch (error) {
      console.error("Error submitting comment:", error.response?.data || error.message);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    try {
      const response = await axios.post(
        `http://localhost:5000/api/admin/blog/${id}/comment/${replyingTo}/reply`,
        { content: replyContent },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(
        comments.map((comment) =>
          comment._id === replyingTo
            ? {
                ...comment,
                replies: [...(comment.replies || []), response.data],
              }
            : comment
        )
      );
      setReplyingTo(null);
      setReplyContent("");
    } catch (error) {
      console.error("Error submitting reply:", error.response?.data || error.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/blog/${id}/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(comments.filter((comment) => comment._id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error.response?.data || error.message);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/admin/blog/${id}/comment/${commentId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(
        comments.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                isLiked: !comment.isLiked,
                likeCount: comment.isLiked ? comment.likeCount - 1 : comment.likeCount + 1,
              }
            : comment
        )
      );
    } catch (error) {
      console.error("Error liking comment:", error.response?.data || error.message);
    }
  };

  const handleReportComment = async (commentId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/blog/${id}/comment/${commentId}/report`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Optional: Give feedback to the user after reporting a comment
    } catch (error) {
      console.error("Error reporting comment:", error.response?.data || error.message);
    }
  };

  return (
    <div className="blog-details-container">
      {blog && (
        <>
          <div className="blog-details-header">
            {/* Blog image and info */}
            <div className="blog-info-container">
              <h1 className="blog-title">{blog.title}</h1>
              <p className="blog-description">{blog.content}</p>
              {/* Comments Section */}
              <div className="comments-section">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div className="comment" key={comment._id}>
                      <div className="comment-header">
                        <img
                          src={comment.user.profilePicture || "/default-user.png"}
                          alt={`${comment.user.firstName} ${comment.user.lastName}`}
                          className="comment-user-picture"
                        />
                        <span className="comment-user-name">
                          {comment.user.firstName} {comment.user.lastName}
                          {comment.user.role === "admin" && (
                            <MdVerified className="verified-icon" />
                          )}
                        </span>
                        <span className="comment-timestamp">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                        {/* Delete Button for reported/disrespectful comments */}
                        {comment.reported && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="delete-comment-button"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="comment-content">{comment.content}</p>
                      <div className="comment-actions">
                        <span onClick={() => handleLikeComment(comment._id)}>
                          {comment.isLiked ? (
                            <AiFillLike className="commentliked" />
                          ) : (
                            <AiOutlineLike className="commentlike-icon" />
                          )}
                        </span>
                        <button onClick={() => handleReportComment(comment._id)}>
                          Report
                        </button>
                        <span
                          className="reply-button"
                          onClick={() => setReplyingTo(comment._id)}
                        >
                          Reply
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No comments yet.</p>
                )}
              </div>
              {/* New Comment Input */}
              <div className="add-comment">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                />
                <button onClick={handleCommentSubmit} className="send-button">
                  <AiOutlineSend />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminBlogDetails;
