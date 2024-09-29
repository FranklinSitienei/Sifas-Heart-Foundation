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
  const [userProfile, setUserProfile] = useState(null); // Logged-in user profile

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

      console.log("Fetched Blog Details:", response.data); // Log the response

      setBlog(response.data);
      setComments(
        Array.isArray(response.data.comments) ? response.data.comments : []
      ); // Ensure it's an array
    } catch (error) {
      console.error(
        "Error fetching blog details:",
        error.response?.data || error.message
      );
    }
  };

  const handleLikeToggle = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/blog/${id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the blog's like status
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

  const handleReplySubmit = async (commentId, replyContent) => {
    if (!replyContent.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/blog/${id}/comment/${commentId}/reply`,
        { content: replyContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update comments with the new reply
      setComments(
        comments.map((comment) => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: [...comment.replies, response.data],
            };
          }
          return comment;
        })
      );
    } catch (error) {
      console.error(
        "Error submitting reply:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="blog-details-container">
      {blog && (
        <>
          <div className="blog-details-header">
            <div className="blog-image-container">
              {blog.image ? (
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="blog-details-media"
                />
              ) : blog.video ? (
                <iframe
                  src={blog.video}
                  title={blog.title}
                  frameBorder="0"
                  allowFullScreen
                  className="blog-details-media"
                ></iframe>
              ) : (
                <div className="placeholder-media">No Media</div>
              )}
            </div>
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
                <span onClick={handleLikeToggle}>
                  {blog.isLiked ? (
                    <AiFillLike className="like-icon liked" />
                  ) : (
                    <AiOutlineLike className="like-icon" />
                  )}
                </span>
                <span>{blog.likeCount} Likes</span>
                <span>
                  {new Date(blog.date).toLocaleDateString()}{" "}
                  {new Date(blog.date).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          <div className="comments-section">
            <h2>Comments</h2>
            {Array.isArray(comments) && comments.length > 0 ? ( // Check if comments is an array
              comments.map((comment) => (
                <div className="comment" key={comment._id}>
                  {/* ... rest of the code ... */}
                </div>
              ))
            ) : (
              <p className="no-comments">
                No comments yet. Be the first to comment! 😊
              </p>
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
        </>
      )}
    </div>
  );
};

export default BlogDetails;
