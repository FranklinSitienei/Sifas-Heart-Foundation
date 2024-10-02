// BlogDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { AiOutlineLike, AiFillLike, AiOutlineSend } from "react-icons/ai";
import { MdVerified } from "react-icons/md";
import "../css/BlogDetails.css";

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  useEffect(() => {
    if (id) {
      fetchBlogDetails();
    }
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/auth/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserProfile(response.data);
    } catch (error) {
      console.error(
        "Error fetching user profile:",
        error.response?.data || error.message
      );
    }
  };

  const fetchBlogDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/blog/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBlog(response.data);
      setComments(
        Array.isArray(response.data.comments) ? response.data.comments : []
      );
    } catch (error) {
      console.error(
        "Error fetching blog details:",
        error.response?.data || error.message
      );
    }
  };

  const handleLikeToggle = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/blog/${id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBlog((prevBlog) => ({
        ...prevBlog,
        isLiked: !prevBlog.isLiked,
        likeCount: prevBlog.isLiked
          ? prevBlog.likeCount - 1
          : prevBlog.likeCount + 1,
      }));
    } catch (error) {
      console.error(
        "Error toggling like:",
        error.response?.data || error.message
      );
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/blog/${id}/comment`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComments([...comments, response.data]);
      setNewComment("");
    } catch (error) {
      console.error(
        "Error submitting comment:",
        error.response?.data || error.message
      );
    }
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/blog/${id}/comment/${replyingTo}/reply`,
        { content: replyContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments(
        comments.map((comment) => {
          if (comment._id === replyingTo) {
            return {
              ...comment,
              replies: Array.isArray(comment.replies)
                ? [...comment.replies, response.data]
                : [response.data],
            };
          }
          return comment;
        })
      );

      setReplyingTo(null);
      setReplyContent("");
    } catch (error) {
      console.error(
        "Error submitting reply:",
        error.response?.data || error.message
      );
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/blog/${id}/comment/${commentId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments(
        comments.map((comment) => {
          if (comment._id === commentId) {
            const isLiked = comment.isLiked || false;
            const likeCount = comment.likeCount || 0;
            return {
              ...comment,
              isLiked: !isLiked,
              likeCount: isLiked ? likeCount - 1 : likeCount + 1,
            };
          }
          return comment;
        })
      );
    } catch (error) {
      console.error(
        "Error liking comment:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="blog-details-container">
      {blog && (
        <>
          <div className="blog-details-header">
            <div
              className="blog-image-container"
              onDoubleClick={handleLikeToggle}
            >
              {blog.image ? (
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="blog-details-media"
                />
              ) : blog.video ? (
                <video controls className="blog-details-media">
                  <source src={blog.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="placeholder-media">No Media</div>
              )}
            </div>
            <div className="blog-info-container">
              <div className="blog-info">
                <h1 className="blog-title">{blog.title}</h1>
                <p className="blog-description">{blog.content}</p>
                {blog.tags && blog.tags.length > 0 && (
                  <div className="blog-tags">
                    {blog.tags.map((tag) => (
                      <Link key={tag} to={`/tags/${tag}`} className="tag">
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Comments Section */}
                <div className="comments-section">
                  <h2>Comments</h2>
                  {Array.isArray(comments) && comments.length > 0 ? (
                    comments.map((comment) => (
                      <div className="comment" key={comment._id}>
                        <div className="comment-header">
                          <img
                            src={
                              comment.user.profilePicture || "/default-user.png"
                            }
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
                        </div>
                        <p className="comment-content">{comment.content}</p>
                        <div className="comment-actions">
                          <button
                            className="reply-button"
                            onClick={() => {
                              setReplyingTo(comment._id);
                            }}
                          >
                            Reply
                          </button>                         
                          <span
                            className="like-button"
                            onClick={() => handleLikeComment(comment._id)}
                          >
                            {comment.isLiked ? (
                              <AiFillLike className="commentliked" />
                            ) : (
                              <AiOutlineLike className="commentlike-icon" />
                            )}
                          </span>
                          <span className="like-count">
                            {comment.likeCount || 0}
                          </span>
                        </div>
                        {/* Reply Input */}
                        {replyingTo === comment._id && (
                          <div className="reply-input">
                            <textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Write a reply..."
                            />
                            <div className="reply-buttons">
                              <button
                                className="cancel-button"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyContent("");
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                className="send-reply-button"
                                onClick={handleReplySubmit}
                              >
                                Send
                              </button>
                            </div>
                          </div>
                        )}
                        {/* Replies */}
                        {Array.isArray(comment.replies) &&
                          comment.replies.length > 0 && (
                            <div className="replies">
                              {comment.replies.map((reply) => (
                                <div className="reply" key={reply._id}>
                                  <img
                                    src={
                                      reply.user.profilePicture ||
                                      "/default-user.png"
                                    }
                                    alt={`${reply.user.firstName} ${reply.user.lastName}`}
                                    className="reply-user-picture"
                                  />
                                  <div className="reply-info">
                                    <span className="reply-user-name">
                                      {reply.user.firstName}{" "}
                                      {reply.user.lastName}
                                      {reply.user.role === "admin" && (
                                        <MdVerified className="verified-icon" />
                                      )}
                                    </span>
                                    <p className="reply-content">
                                      {reply.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    ))
                  ) : (
                    <p>No comments yet.</p>
                  )}

                  <div className="blog-details-actions">
                    <span onClick={handleLikeToggle} className="like-button">
                      {blog.isLiked ? (
                        <AiFillLike className="like-icon liked" />
                      ) : (
                        <AiOutlineLike className="like-icon" />
                      )}
                    </span>
                    <span className="like-count">{blog.likeCount} Likes</span>
                  </div>
                </div>
                <span className="blog-date">
                      {new Date(blog.date).toLocaleDateString()}{" "}
                      {new Date(blog.date).toLocaleTimeString()}
                    </span>
                {/* New Comment Input */}
                {userProfile && (
              <div className="add-comment">
                <img
                  src={userProfile.profilePicture || "/default-user.png"}
                  alt={`${userProfile.firstName} ${userProfile.lastName}`}
                  className="user-profile-picture"
                />
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                />
                <button onClick={handleCommentSubmit} className="send-button">
                  <AiOutlineSend />
                </button>
              </div>
            )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BlogDetails;
