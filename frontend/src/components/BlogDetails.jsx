// src/components/BlogDetails.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  AiOutlineLike,
  AiFillLike,
  AiOutlineSend,
  AiOutlineEllipsis,
  AiFillHeart
} from "react-icons/ai";
import { MdVerified } from "react-icons/md";
import { HiOutlineEllipsisVertical } from "react-icons/hi2";
import { HiOutlineArrowDown, HiOutlineArrowUp } from "react-icons/hi";
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
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userId, setUserId] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyLimit, setReplyLimit] = useState(2);

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
        "https://sifas-heart-foundation-1.onrender.com/api/auth/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserProfile(response.data);
      // Sort comments: user's comments first
      const sortedComments = sortComments(response.data.comments || [], token.id);
      setComments(sortedComments);
    } catch (error) {
      console.error(
        "Error fetching user profile:",
        error.response?.data || error.message
      );
    }
  };

  const sortComments = (commentsList, currentUserId) => {
    if (!currentUserId) return commentsList;
    const sorted = [...commentsList].sort((a, b) => {
      if (a.user._id === currentUserId && b.user._id !== currentUserId) return -1;
      if (a.user._id !== currentUserId && b.user._id === currentUserId) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt); // Newer comments first
    });
    return sorted;
  };

  const fetchBlogDetails = async () => {
    try {
      const response = await axios.get(`https://sifas-heart-foundation-1.onrender.com/blog/${id}`, {
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
        `https://sifas-heart-foundation-1.onrender.com/api/blog/user/${id}/like`,
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
        `https://sifas-heart-foundation-1.onrender.com/api/blog/user/${id}/comment`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComments([...comments, response.data]);
      setNewComment("");
      setShowSuggestions(false);
    } catch (error) {
      console.error(
        "Error submitting comment:",
        error.response?.data || error.message
      );
    }
  };

  const handleReplyChange = (e) => {
    const value = e.target.value;
    setReplyContent(value);
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const mention = value.substring(lastAtIndex + 1);
      fetchMentionSuggestions(mention);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;

    try {
      const response = await axios.post(
        `https://sifas-heart-foundation-1.onrender.com/api/blog/user/${id}/comment/${replyingTo}/reply`,
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
      setShowSuggestions(false);
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
        `https://sifas-heart-foundation-1.onrender.com/api/blog/user/${id}/comment/${commentId}/like`,
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
        `https://sifas-heart-foundation-1.onrender.com/api/blog/user/${id}/comment/${commentId}/unlike`,
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
        `https://sifas-heart-foundation-1.onrender.com/api/blog/user/${id}/comment/${commentId}/reply/${replyId}/like`,
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
        `https://sifas-heart-foundation-1.onrender.com/api/blog/user/${id}/comment/${commentId}/reply/${replyId}/unlike`,
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
        `https://sifas-heart-foundation-1.onrender.com/api/blog/user/${id}/comment/${commentId}/report`,
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
        `https://sifas-heart-foundation-1.onrender.com/api/blog/user/${id}/comment/${commentId}/reply/${replyId}/report`,
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

  const handleEditComment = (comment) => {
    const newContent = prompt("Edit your comment:", comment.content);
    if (newContent) {
      // Call the API to update the comment
      fetch(`https://sifas-heart-foundation-1.onrender.com/api/blog/${id}/comment/${comment._id}/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newContent }),
      })
        .then((response) => {
          if (response.ok) {
            // Update state to reflect the edited comment
            const updatedComments = comments.map((c) =>
              c._id === comment._id ? { ...c, content: newContent } : c
            );
            setComments(updatedComments);
          } else {
            console.error("Failed to edit comment");
          }
        })
        .catch((err) => console.error("Error editing comment:", err));
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
    if (confirmDelete) {
      try {
        const response = await fetch(`https://sifas-heart-foundation-1.onrender.com/api/blog/${id}/comment/${commentId}/delete`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          // Update state to remove the comment from UI
          setComments(comments.filter((comment) => comment._id !== commentId));
        } else {
          console.error("Failed to delete comment:", response.statusText);
        }
      } catch (err) {
        console.error("Error deleting comment:", err);
      }
    }
  };

  const handleEditReply = (reply) => {
    const newContent = prompt("Edit your reply:", reply.content);
    if (newContent) {
      fetch(`https://sifas-heart-foundation-1.onrender.com/api/blog/${id}/comment/${reply.commentId}/reply/${reply._id}/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newContent }),
      })
        .then((response) => {
          if (response.ok) {
            const updatedComments = comments.map((c) => {
              if (c._id === reply.commentId) {
                return {
                  ...c,
                  replies: c.replies.map((r) =>
                    r._id === reply._id ? { ...r, content: newContent } : r
                  ),
                };
              }
              return c;
            });
            setComments(updatedComments);
          } else {
            console.error("Failed to edit reply");
          }
        })
        .catch((err) => console.error("Error editing reply:", err));
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this reply?");
    if (confirmDelete) {
      try {
        const response = await fetch(`https://sifas-heart-foundation-1.onrender.com/api/blog/${id}/comment/${commentId}/reply/${replyId}/delete`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          // Update state to remove the reply from the UI
          setComments((prevComments) =>
            prevComments.map((comment) => {
              if (comment._id === commentId) {
                return {
                  ...comment,
                  replies: comment.replies.filter((reply) => reply._id !== replyId),
                };
              }
              return comment;
            })
          );
        } else {
          console.error("Failed to delete reply:", response.statusText);
        }
      } catch (err) {
        console.error("Error deleting reply:", err);
      }
    }
  };

  const fetchMentionSuggestions = async (query) => {
    if (query.trim().length > 1) {
      try {
        const response = await axios.get(`https://sifas-heart-foundation-1.onrender.com/api/blog/users/search?query=${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMentionSuggestions(response.data);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching mention suggestions:", error);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    setNewComment(value);

    // Detecting '@' and fetching suggestions
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const mention = value.substring(lastAtIndex + 1);
      fetchMentionSuggestions(mention);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectMention = (user) => {
    if (replyingTo) {
      const lastAtIndex = replyContent.lastIndexOf("@");
      const beforeMention = replyContent.substring(0, lastAtIndex);
      const afterMention = replyContent.substring(lastAtIndex + 1);
      const newReplyValue = `${beforeMention}@${user.firstName} ${user.lastName} ${afterMention}`;
      setReplyContent(newReplyValue);
    } else {
      const lastAtIndex = newComment.lastIndexOf("@");
      const beforeMention = newComment.substring(0, lastAtIndex);
      const afterMention = newComment.substring(lastAtIndex + 1);
      const newCommentValue = `${beforeMention}@${user.firstName} ${user.lastName} ${afterMention}`;
      setNewComment(newCommentValue);
    }
    setShowSuggestions(false);
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const showMoreReplies = (commentId) => {
    setReplyLimit((prev) => ({
      ...prev,
      [commentId]: prev[commentId] ? prev[commentId] + 5 : 5,
    }));
  };

  const showLessReplies = (commentId) => {
    setReplyLimit((prev) => ({
      ...prev,
      [commentId]: 2,
    }));
  };

  const renderEmbeddedMedia = (url) => {
    // Check the URL and return an iframe based on the platform
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0]}`}
          title="YouTube video"
          className="video"
          allowFullScreen
        />
      );
    } else if (url.includes('tiktok.com')) {
      return (
        <iframe
          src={url.replace('tiktok.com', 't.tiktok.com')}
          title="TikTok video"
          className="video"
          allowFullScreen
        />
      );
    } else if (url.includes('twitter.com')) {
      return (
        <blockquote className="twitter-tweet">
          <a href={url}>View Tweet</a>
        </blockquote>
      );
    } else if (url.includes('instagram.com')) {
      return (
        <iframe
          src={`https://instagram.com/p/${url.split('/p/')[1]}/embed`}
          title="Instagram post"
          className="video"
          allowFullScreen
        />
      );
    } else if (url.includes('gofundme.com')) {
      return (
        <iframe
          src={url}
          title="GoFundMe"
          className="video"
          allowFullScreen
        />
      );
    }
    return null; // Default case
  };

  return (
    <div className="blog-details-container">
      {blog && (
        <div className="blog-details-content">
          {/* Blog Image */}
          <div className="blog-image-container" onDoubleClick={handleLikeToggle}>
            {blog.image && (
              <div className="media-container">
                <img src={blog.image} alt={blog.title} className="media" />
                <button className="donate-button"><Link to="/donations">Donate</Link></button>
              </div>
            )}
            {blog.video && (
              <div className="media-container">
                {renderEmbeddedMedia(blog.video)}
                <button className="donate-button">Donate</button>
              </div>
            )}
          </div>

          {/* Blog Info and Comments */}
          <div className="blog-info-container">
            {/* Admin Details with Profile Picture */}
            <div className="admin-info">
              <img
                src={blog.admin.profilePicture || "/default-user.png"}
                alt={`${blog.admin.firstName} ${blog.admin.lastName}`}
                className="admin-profile-picture"
              />
              <div className="admin-details">
                <span className="admin-name">
                  {blog.admin.firstName} {blog.admin.lastName}
                  <MdVerified className="verified-icon" />
                </span>
                <span className="admin-role">Creator</span>
              </div>
            </div>

            <div className="blog-info">
              <h1 className="blog-title">{blog.title}</h1>
              <p className="blog-description">{blog.content}</p>
              {blog.tags && blog.tags.length > 0 && (
                <div className="blog-tags">
                  {blog.tags.map((tag) => (
                    <Link key={tag} to={`/tags/${tag}`} className="tag">
                      {tag}
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
                  comments
                    .sort((a, b) => {
                      const loggedInUser = localStorage.getItem('admin');
                      if (a.user?._id === loggedInUser?._id || a.admin?._id === loggedInUser?._id) return -1;
                      if (b.user?._id === loggedInUser?._id || b.admin?._id === loggedInUser?._id) return 1;
                      return 0;
                    })
                    .map((comment) => (
                      <div className="comment" key={comment._id}>
                        <div className="comment-header">
                          <div className="comment-profile-wrapper">
                            <img
                              src={comment.user?.profilePicture || comment.admin?.profilePicture || "/default-user.png"}
                              alt={`${comment.user?.firstName || comment.admin?.firstName || 'Unknown'} ${comment.user?.lastName || comment.admin?.lastName || ''}`}
                              className="comment-user-picture"
                            />
                            {comment.admin && comment.isLiked && (
                              <div className="like-icon-wrapper">
                                <AiFillHeart className="admin-like-icon" />
                              </div>
                            )}
                          </div>
                          <span className="comment-user-name">
                            {comment.user ? (
                              `${comment.user.firstName} ${comment.user.lastName}`
                            ) : comment.admin ? (
                              <>
                                {`${comment.admin.firstName} ${comment.admin.lastName}`}
                                <MdVerified className="verified-icon" />
                                <span className="admin-label">Creator</span>
                              </>
                            ) : (
                              'Anonymous'
                            )}
                          </span>

                          <span className="comment-timestamp">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                          <div className="options-dropdown" ref={dropdownRef}>
                            <HiOutlineEllipsisVertical
                              className="options-icon"
                              onClick={() => toggleDropdown(comment._id)}
                            />
                            {activeDropdown === comment._id && (
                              <div className="dropdown-menu">
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleEditComment(comment)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleDeleteComment(comment._id)}
                                >
                                  Delete
                                </button>
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
                        <p className="comment-content">
                          {comment.content.split(/(\s+)/).map((word, i) =>
                            word.startsWith('@') ? (
                              <span key={i} style={{ color: 'blue' }}>
                                {word}
                              </span>
                            ) : (
                              word
                            )
                          )}
                        </p>

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

                          {/* Toggle Replies Button */}
                          {comment.replies?.length > 0 && (
                            <button
                              className="toggle-replies-button"
                              onClick={() => toggleReplies(comment._id)}
                            >
                              {expandedReplies[comment._id] ? (
                                <>
                                  Hide Replies <HiOutlineArrowUp />
                                  {comment.replies.some(reply => reply.admin) && (
                                    <img
                                      src={comment.replies.find(reply => reply.admin)?.admin?.profilePicture || "/default-user.png"}
                                      alt="Admin"
                                      className="reply-admin-picture"
                                    />
                                  )}
                                </>
                              ) : (
                                <>
                                  Show Replies ({comment.replies.length}) <HiOutlineArrowDown />
                                </>
                              )}
                            </button>
                          )}

                        </div>

                        {/* Reply Input */}
                        {replyingTo === comment._id && (
                          <div className="reply-input">
                            <textarea
                              value={replyContent}
                              onChange={handleReplyChange}
                              placeholder="Write a reply..."
                            />
                            {showSuggestions && (
                              <div className="suggestion-list">
                                {mentionSuggestions.map((user) => (
                                  <div
                                    key={user._id}
                                    className="suggestion-item"
                                    onClick={() => selectMention(user)}
                                  >
                                    <img
                                      src={user.profilePicture || "/default-user.png"}
                                      alt={`${user.firstName} ${user.lastName}`}
                                      className="suggestion-user-picture"
                                    />
                                    <span>{user.firstName} {user.lastName}</span>
                                  </div>
                                ))}
                              </div>
                            )}

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
                        {expandedReplies[comment._id] && (
                          <div className="replies">
                            {Array.isArray(comment.replies) && comment.replies.length > 0 && (
                              <>
                                {comment.replies.slice(0, replyLimit[comment._id] || 5).map((reply) => (
                                  <div className="reply" key={reply._id}>
                                    <div className="reply-profile-wrapper">
                                      <img
                                        src={reply.user?.profilePicture || reply.admin?.profilePicture || "/default-user.png"}
                                        alt={`${reply.user?.firstName || reply.admin?.firstName || 'Unknown'} ${reply.user?.lastName || reply.admin?.lastName || ''}`}
                                        className="reply-user-picture"
                                      />
                                      {reply.admin && reply.isLiked && (
                                        <div className="like-icon-wrapper">
                                          <AiFillHeart className="admin-like-icon" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="reply-info">
                                      <span className="reply-user-name">
                                        {reply.user?.firstName} {reply.user?.lastName}
                                        {reply.admin && (
                                          <>
                                            {reply.admin.firstName} {reply.admin.lastName}
                                            <MdVerified className="verified-icon" />
                                            <span className="admin-label">Creator</span>
                                          </>
                                        )}
                                      </span>
                                      <span className="reply-timestamp">
                                        {new Date(reply.createdAt).toLocaleString()}
                                      </span>
                                      <p className="comment-content">
                                        {reply.content.split(/(\s+)/).map((word, i) =>
                                          word.startsWith('@') ? (
                                            <span key={i} style={{ color: 'blue' }}>
                                              {word}
                                            </span>
                                          ) : (
                                            word
                                          )
                                        )}
                                      </p>
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
                                        <HiOutlineEllipsisVertical
                                          className="reply-options-icon"
                                          onClick={() => toggleDropdown(reply._id)}
                                        />
                                        {activeDropdown === reply._id && (
                                          <div className="reply-dropdown-menu">
                                            <button
                                              className="reply-dropdown-item"
                                              onClick={() => handleEditReply(reply, comment._id)}
                                            >
                                              Edit
                                            </button>
                                            <button
                                              className="reply-dropdown-item"
                                              onClick={() => handleDeleteReply(comment._id, reply._id)}
                                            >
                                              Delete
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {/* Show More / Show Less Replies */}
                                {comment.replies.length > (replyLimit[comment._id] || 5) && (
                                  <div className="show-more-replies">
                                    <button onClick={() => showMoreReplies(comment._id)}>
                                      Show More Replies
                                    </button>
                                    <button onClick={() => showLessReplies(comment._id)}>
                                      Show Less Replies
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <p>No comments yet. Be the first to comment!</p>
                )}
              </div>
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
                    onChange={handleCommentChange}
                    placeholder="Add a comment..."
                    className="add-comment-input"
                  />

                  {showSuggestions && (
                    <div className="suggestion-list">
                      {mentionSuggestions.map((user) => (
                        <div
                          key={user._id}
                          className="suggestion-item"
                          onClick={() => selectMention(user)}
                          style={{ display: 'flex', alignItems: 'center', padding: '5px' }} // Flex layout for suggestions
                        >
                          <img
                            src={user.profilePicture || "/default-user.png"}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="suggestion-user-picture" // Add a class for styling
                            style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }} // Profile picture style
                          />
                          <span>{user.firstName} {user.lastName}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button className="send-comment-button" onClick={handleCommentSubmit}>
                    <AiOutlineSend />
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )
      }
    </div >
  );
};

export default BlogDetails;

