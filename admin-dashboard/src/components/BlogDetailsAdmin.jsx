// BlogDetailsAdmin.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  AiOutlineLike,
  AiFillLike,
  AiOutlineSend,
  AiFillEdit,
  AiFillDelete,
} from "react-icons/ai";
import { MdVerified } from "react-icons/md";
import "../css/BlogDetails.css";

const BlogDetailsAdmin = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
    // eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    if (id) {
      fetchBlogDetails();
    }
    // eslint-disable-next-line
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
      setComments(Array.isArray(response.data.comments) ? response.data.comments : []);
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

  const handleEditComment = async () => {
    if (!editingContent.trim()) return;

    try {
      await axios.put(
        `http://localhost:5000/api/blog/${id}/comment/${editingComment}/edit`,
        { content: editingContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments(
        comments.map((comment) => {
          if (comment._id === editingComment) {
            return {
              ...comment,
              content: editingContent,
            };
          }
          return comment;
        })
      );

      setEditingComment(null);
      setEditingContent("");
    } catch (error) {
      console.error(
        "Error editing comment:",
        error.response?.data || error.message
      );
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/blog/${id}/comment/${commentId}/delete`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments(
        comments.filter((comment) => comment._id !== commentId)
      );
    } catch (error) {
      console.error(
        "Error deleting comment:",
        error.response?.data || error.message
      );
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/blog/${id}/comment/${commentId}/reply/${replyId}/delete`,
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
              replies: comment.replies.filter((reply) => reply._id !== replyId),
            };
          }
          return comment;
        })
      );
    } catch (error) {
      console.error(
        "Error deleting reply:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="blog-details-container">
      {blog && (
        <div className="blog-details-content">
          {/* Media Section */}
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

          {/* Blog Info and Comments Section */}
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

              {/* Actions */}
              <div className="blog-details-actions">
                <span onClick={handleLikeToggle} className="like-button">
                  {blog.isLiked ? (
                    <AiFillLike className="like-icon liked" />
                  ) : (
                    <AiOutlineLike className="like-icon" />
                  )}
                </span>
                <span className="like-count">{blog.likeCount} Likes</span>
                <span className="blog-date">
                  {new Date(blog.date).toLocaleDateString()}{" "}
                  {new Date(blog.date).toLocaleTimeString()}
                </span>
              </div>
            </div>

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
                      {/* Admin Actions */}
                      {(userProfile?.role === "admin" ||
                        userProfile?._id === comment.user._id) && (
                        <span className="admin-actions">
                          {/* Edit Button */}
                          {userProfile?.role === "admin" && (
                            <AiFillEdit
                              className="admin-icon edit-icon"
                              onClick={() => {
                                setEditingComment(comment._id);
                                setEditingContent(comment.content);
                              }}
                            />
                          )}
                          {/* Delete Button */}
                          {userProfile?.role === "admin" && (
                            <AiFillDelete
                              className="admin-icon delete-icon"
                              onClick={() => handleDeleteComment(comment._id)}
                            />
                          )}
                        </span>
                      )}
                    </div>
                    {/* Edit Comment Input */}
                    {editingComment === comment._id ? (
                      <div className="edit-comment-input">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          placeholder="Edit your comment..."
                        />
                        <div className="edit-buttons">
                          <button
                            className="cancel-edit-button"
                            onClick={() => {
                              setEditingComment(null);
                              setEditingContent("");
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="save-edit-button"
                            onClick={handleEditComment}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="comment-content">{comment.content}</p>
                    )}
                    <div className="comment-actions">
                      <button
                        className="reply-button"
                        onClick={() => {
                          setReplyingTo(comment._id);
                        }}
                      >
                        Reply
                      </button>
                      <span className="like-button" onClick={() => handleLikeComment(comment._id)}>
                        {comment.isLiked ? (
                          <AiFillLike className="like-icon liked" />
                        ) : (
                          <AiOutlineLike className="like-icon" />
                        )}
                      </span>
                      <span className="like-count">
                        {comment.likeCount || 0} Likes
                      </span>
                      {/* Admin Delete Reply Option */}
                      {userProfile?.role === "admin" && (
                        <span className="admin-actions-reply">
                          <AiFillDelete
                            className="admin-icon delete-icon"
                            onClick={() =>
                              handleDeleteReply(comment._id, reply._id)
                            }
                          />
                        </span>
                      )}
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
                              src={
                                reply.user.profilePicture ||
                                "/default-user.png"
                              }
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
                              <p className="reply-content">{reply.content}</p>
                              {/* Admin Actions for Replies */}
                              {(userProfile?.role === "admin" ||
                                userProfile?._id === reply.user._id) && (
                                <span className="admin-actions">
                                  {/* Edit Button */}
                                  {userProfile?.role === "admin" && (
                                    <AiFillEdit
                                      className="admin-icon edit-icon"
                                      onClick={() => {
                                        setEditingComment(reply._id);
                                        setEditingContent(reply.content);
                                      }}
                                    />
                                  )}
                                  {/* Delete Button */}
                                  {userProfile?.role === "admin" && (
                                    <AiFillDelete
                                      className="admin-icon delete-icon"
                                      onClick={() =>
                                        handleDeleteReply(comment._id, reply._id)
                                      }
                                    />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-comments">No comments yet.</p>
              )}

              {/* Add Comment Form */}
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
      )}
    </div>
  );
};

export default BlogDetailsAdmin;
