import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCamera } from 'react-icons/fa'; // Import camera icon
import '../css/createBlog.css';

const CreateBlog = () => {
  const [admin, setAdmin] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [embedCode, setEmbedCode] = useState(''); // Embed code for social media
  const [tags, setTags] = useState([]); // State to manage tags

  useEffect(() => {
    const fetchAdminProfile = async () => {
      const token = localStorage.getItem('admin');
      try {
        const response = await axios.get('https://sifas-heart-foundation-1.onrender.com/api/admin/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmin(response.data);
      } catch (error) {
        console.error('Failed to fetch admin profile:', error);
      }
    };

    fetchAdminProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file)); // Show preview for uploaded file
      setMediaUrl(''); // Clear URL if file is selected
    }
  };

  const isYouTubeUrl = (url) => /youtube\.com|youtu\.be/.test(url);
  const isTikTokUrl = (url) => /tiktok\.com/.test(url);
  const isTwitterUrl = (url) => /twitter\.com/.test(url);
  const isInstagramUrl = (url) => /instagram\.com/.test(url);
  const isGoFundMeUrl = (url) => /gofundme\.com/.test(url);

  const generateEmbedCode = (url) => {
    if (isYouTubeUrl(url)) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    } else if (isTikTokUrl(url) || isTwitterUrl(url) || isInstagramUrl(url) || isGoFundMeUrl(url)) {
      return url;
    }
    return '';
  };

  const handleMediaUrlChange = (e) => {
    const url = e.target.value;
    setMediaUrl(url);
    setMediaFile(null); // Clear file if URL is provided
    setMediaPreview(''); // Clear preview if URL is provided

    const embed = generateEmbedCode(url);
    setEmbedCode(embed);
  };

  const handleTagChange = (e) => {
    const inputValue = e.target.value;
    if (e.key === 'Enter' && inputValue.trim()) {
      // Prevent adding duplicate hashtags
      const newTag = inputValue.startsWith('#') ? inputValue : `#${inputValue}`;
      if (!tags.includes(newTag)) {
        setTags((prevTags) => [...prevTags, newTag]);
      }
      e.target.value = ''; // Clear input after adding tag
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    tags.forEach((tag) => formData.append('tags', tag)); // Add tags to form data

    if (mediaFile) {
      formData.append('media', mediaFile);
    } else if (mediaUrl) {
      formData.append('mediaUrl', mediaUrl); // Send mediaUrl if provided
    }

    try {
      const token = localStorage.getItem('admin');
      await axios.post('https://sifas-heart-foundation-1.onrender.com/api/blog/admin/create', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      alert('Blog created successfully!');
      setTitle('');
      setContent('');
      setMediaType('image');
      setMediaPreview('');
      setMediaFile(null);
      setMediaUrl('');
      setEmbedCode('');
      setTags([]); // Clear tags after submission
    } catch (error) {
      console.error('Failed to create blog:', error);
      alert('Error creating blog');
    }
  };

  return admin ? (
    <div className="create-blog-container">
      <h2>Create a New Blog Post</h2>
      <form onSubmit={handleSubmit} className="create-blog-form">
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>

        <label>Choose Media Type</label>
        <select
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value)}
        >
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>

        <div className="media-input-container">
          <div className="media-upload-icon">
            {mediaPreview ? (
              mediaType === 'image' ? (
                <img src={mediaPreview} alt="Preview" className="media-preview" />
              ) : (
                <iframe
                  src={embedCode}
                  title="Video Preview"
                  className="media-preview"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              )
            ) : (
              <label className="upload-label">
                <FaCamera className="camera-icon" />
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden-input"
                />
                Choose file (Image or Video)
              </label>
            )}
          </div>

          <input
            type="text"
            placeholder="Paste media URL"
            value={mediaUrl}
            onChange={handleMediaUrlChange}
          />
        </div>

        <div className="tags-container">
          <label>Tags</label>
          <input
            type="text"
            placeholder="Add tags and press Enter"
            onKeyDown={handleTagChange}
          />
          <div className="tags-display">
            {tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        </div>

        <button type="submit">Create Blog</button>
      </form>
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default CreateBlog;
