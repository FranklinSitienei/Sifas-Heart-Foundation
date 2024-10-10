// src/components/BlogDetails.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  AiOutlineLike,
  AiFillLike,
  AiOutlineSend,
  AiOutlineEllipsis,
} from "react-icons/ai";
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
  const [activeDropdown, setActiveDropdown] = useState(null);

  const token = localStorage.getItem("token");
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

      const fetchedBlog = response.data;
      setBlog(fetchedBlog);
      setComments(Array.isArray(fetchedBlog.comments) ? fetchedBlog.comments : []);

      // Load liked states from localStorage
      const likedBlogs = JSON.parse(localStorage.getItem('likedBlogs')) || {};
      if (likedBlogs[id]) {
        fetchedBlog.isLiked = true; // Set if blog was liked
      }
      
      const likedComments = JSON.parse(localStorage.getItem('likedComments')) || {};
      const updatedComments = fetchedBlog.comments.map(comment => {
        comment.isLiked = likedComments[comment._id] || false; // Set liked state for each comment
        return comment;
      });
      setComments(updatedComments);

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
        `http://localhost:5000/api/blog/user/${id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newIsLiked = !blog.isLiked;
      const newLikeCount = newIsLiked ? blog.likeCount + 1 : blog.likeCount - 1;

      // Update the blog state
      setBlog((prevBlog) => ({
        ...prevBlog,
        isLiked: newIsLiked,
        likeCount: newLikeCount,
      }));

      // Update localStorage for blog likes
      const likedBlogs = JSON.parse(localStorage.getItem('likedBlogs')) || {};
      if (newIsLiked) {
        likedBlogs[id] = true; // Mark as liked
      } else {
        delete likedBlogs[id]; // Remove from liked
      }
      localStorage.setItem('likedBlogs', JSON.stringify(likedBlogs));

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
        `http://localhost:5000/api/blog/user/${id}/comment`,
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
        `http://localhost:5000/api/blog/user/${id}/comment/${replyingTo}/reply`,
        { content: replyContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments(
        comments.map((comment) =>
          comment._id === replyingTo
            ? {
                ...comment,
                replies: Array.isArray(comment.replies)
                  ? [...comment.replies, response.data]
                  : [response.data],
              }
            : comment
        )
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
        `http://localhost:5000/api/blog/user/${id}/comment/${commentId}/like`,
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

      // Update localStorage for comment likes
      const likedComments = JSON.parse(localStorage.getItem('likedComments')) || {};
      if (likedComments[commentId]) {
        delete likedComments[commentId]; // Unlike if already liked
      } else {
        likedComments[commentId] = true; // Like if not liked
      }
      localStorage.setItem('likedComments', JSON.stringify(likedComments));

    } catch (error) {
      console.error(
        "Error liking comment:",
        error.response?.data || error.message
      );
    }
  };

  const handleUnlikeComment = async (commentId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/blog/user/${id}/comment/${commentId}/unlike`,
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

      // Update localStorage for comment unlikes
      const likedComments = JSON.parse(localStorage.getItem('likedComments')) || {};
      if (likedComments[commentId]) {
        delete likedComments[commentId]; // Unlike if already liked
      }
      localStorage.setItem('likedComments', JSON.stringify(likedComments));

    } catch (error) {
      console.error(
        "Error unliking comment:",
        error.response?.data || error.message
      );
    }
  };

  const handleLikeReply = async (commentId, replyId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/blog/user/${id}/comment/${commentId}/reply/${replyId}/like`,
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
            return {
              ...comment,
              replies: comment.replies.map((reply) => {
                if (reply._id === replyId) {
                  const isLiked = reply.isLiked || false;
                  const likeCount = reply.likeCount || 0;
                  return {
                    ...reply,
                    isLiked: !isLiked,
                    likeCount: isLiked ? likeCount - 1 : likeCount + 1,
                  };
                }
                return reply;
              }),
            };
          }
          return comment;
        })
      );

    } catch (error) {
      console.error(
        "Error liking reply:",
        error.response?.data || error.message
      );
    }
  };

  const handleUnlikeReply = async (commentId, replyId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/blog/user/${id}/comment/${commentId}/reply/${replyId}/unlike`,
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
            return {
              ...comment,
              replies: comment.replies.map((reply) => {
                if (reply._id === replyId) {
                  const isLiked = reply.isLiked || false;
                  const likeCount = reply.likeCount || 0;
                  return {
                    ...reply,
                    isLiked: !isLiked,
                    likeCount: isLiked ? likeCount - 1 : likeCount + 1,
                  };
                }
                return reply;
              }),
            };
          }
          return comment;
        })
      );

    } catch (error) {
      console.error(
        "Error unliking reply:",
        error.response?.data || error.message
      );
    }
  };

  const handleReportComment = async (commentId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/blog/user/${id}/comment/${commentId}/report`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Comment reported successfully.");
    } catch (error) {
      console.error(
        "Error reporting comment:",
        error.response?.data || error.message
      );
    }
  };

  const handleReportReply = async (commentId, replyId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/blog/user/${id}/comment/${commentId}/reply/${replyId}/report`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Reply reported successfully.");
    } catch (error) {
      console.error(
        "Error reporting reply:",
        error.response?.data || error.message
      );
    }
  };

  const toggleDropdown = (commentId) => {
    setActiveDropdown((prev) => (prev === commentId ? null : commentId));
  };

  return (
    <div className="blog-details-container">
      {blog && (
        <div className="blog-details-content">
          {/* Blog Image */}
          <div className="blog-image-container" onDoubleClick={handleLikeToggle}>
            {blog.image ? (
              <img src={blog.image} alt={blog.title} className="blog-details-media" />
            ) : blog.video ? (
              <video controls className="blog-details-media">
                <source src={blog.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="placeholder-media">No Media</div>
            )}
          </div>

          {/* Blog Info and Comments */}
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

              <div className="blog-details-actions">
                <span onClick={handleLikeToggle} className="like-button">
                  {blog.isLiked ? (
                    <AiFillLike className="like-icon liked" />
                  ) : (
                    <AiOutlineLike className="like-icon" />
                  )}
                </span>
                <span className="like-count">{blog.likeCount || 0} Likes</span>
                <span className="blog-date">
                  {new Date(blog.date).toLocaleDateString()}{" "}
                  {new Date(blog.date).toLocaleTimeString()}
                </span>
              </div>

              {/* Comments Section */}
              <div className="comments-section">
                <h2>Comments</h2>
                {Array.isArray(comments) && comments.length > 0 ? (
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
                        {/* Three-Dot Icon for Report */}
                        <div className="report-dropdown" ref={dropdownRef}>
                          <AiOutlineEllipsis
                            className="report-icon"
                            onClick={() => toggleDropdown(comment._id)}
                          />
                          {activeDropdown === comment._id && (
                            <div className="dropdown-menu">
                              <button
                                className="dropdown-item"
                                onClick={() => handleReportComment(comment._id)}
                              >
                                Report
                              </button>
                            </div>
                          )}
                        </div>
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
                        {comment.isLiked ? (
                          <AiFillLike
                            className="like-icon liked"
                            onClick={() => handleUnlikeComment(comment._id)}
                          />
                        ) : (
                          <AiOutlineLike
                            className="like-icon"
                            onClick={() => handleLikeComment(comment._id)}
                          />
                        )}
                        <span className="like-count">{comment.likeCount || 0}</span>
                        {/* Three-Dot Icon for Report (if needed on actions) */}
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
                      {Array.isArray(comment.replies) && comment.replies.length > 0 && (
                        <div className="replies">
                          {comment.replies.map((reply) => (
                            <div className="reply" key={reply._id}>
                              <img
                                src={reply.user.profilePicture || "/default-user.png"}
                                alt={`${reply.user.firstName} ${reply.user.lastName}`}
                                className="reply-user-picture"
                              />
                              <div className="reply-info">
                                <span className="reply-user-name">
                                  {reply.user.firstName} {reply.user.lastName}
                                  {reply.user.role === "admin" && (
                                    <MdVerified className="verified-icon" />
                                  )}
                                </span>
                                <span className="reply-timestamp">
                                  {new Date(reply.createdAt).toLocaleString()}
                                </span>
                                <p className="reply-content">{reply.content}</p>
                                <div className="reply-actions">
                                  {reply.isLiked ? (
                                    <AiFillLike
                                      className="like-icon liked"
                                      onClick={() => handleUnlikeReply(comment._id, reply._id)}
                                    />
                                  ) : (
                                    <AiOutlineLike
                                      className="like-icon"
                                      onClick={() => handleLikeReply(comment._id, reply._id)}
                                    />
                                  )}
                                  <span className="like-count">{reply.likeCount || 0}</span>
                                  <AiOutlineEllipsis
                                    className="report-icon"
                                    onClick={() => toggleDropdown(reply._id)}
                                  />
                                  {activeDropdown === reply._id && (
                                    <div className="dropdown-menu">
                                      <button
                                        className="dropdown-item"
                                        onClick={() => handleReportReply(comment._id, reply._id)}
                                      >
                                        Report Reply
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No comments yet. Be the first to comment!</p>
                )}

                {/* Add Comment */}
                {userProfile && (
                  <div className="add-comment-section">
                    <img
                      src={userProfile.profilePicture || "/default-user.png"}
                      alt={`${userProfile.firstName} ${userProfile.lastName}`}
                      className="user-profile-picture"
                    />
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="add-comment-input"
                    />
                    <button className="send-comment-button" onClick={handleCommentSubmit}>
                      <AiOutlineSend />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetails;

