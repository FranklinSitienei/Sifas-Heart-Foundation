import React, { useEffect, useState } from 'react';
import axios from 'axios';
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

  useEffect(() => {
    const fetchAdminProfile = async () => {
      const token = localStorage.getItem('admin');
      try {
        const response = await axios.get('http://localhost:5000/api/admin/profile', {
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

  // Helper to check if a URL is a YouTube link
  const isYouTubeUrl = (url) => /youtube\.com|youtu\.be/.test(url);

  // Helper to check if a URL is a TikTok link
  const isTikTokUrl = (url) => /tiktok\.com/.test(url);

  // Helper to check if a URL is a Twitter link
  const isTwitterUrl = (url) => /twitter\.com/.test(url);

  // Helper to check if a URL is an Instagram link
  const isInstagramUrl = (url) => /instagram\.com/.test(url);

  // Helper to check if a URL is a GoFundMe link
  const isGoFundMeUrl = (url) => /gofundme\.com/.test(url);

  // Function to generate the proper embed code based on the URL
  const generateEmbedCode = (url) => {
    if (isYouTubeUrl(url)) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    } else if (isTikTokUrl(url)) {
      return url;
    } else if (isTwitterUrl(url)) {
      return url;
    } else if (isInstagramUrl(url)) {
      return url;
    } else if (isGoFundMeUrl(url)) {
      return url;
    }
    return '';
  };

  const handleMediaUrlChange = (e) => {
    const url = e.target.value;
    setMediaUrl(url);
    setMediaFile(null); // Clear file if URL is provided
    setMediaPreview(''); // Clear preview if URL is provided

    // Set embed code based on the provided URL
    const embed = generateEmbedCode(url);
    setEmbedCode(embed);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);

    // Include media based on whether a file or URL is provided
    if (mediaFile) {
      formData.append('media', mediaFile);
    } else if (mediaUrl) {
      formData.append('mediaUrl', mediaUrl); // Send mediaUrl if provided
    }

    try {
      const token = localStorage.getItem('admin');
      await axios.post('http://localhost:5000/api/blog/create', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      alert('Blog created successfully!');
      // Clear the form after successful submission
      setTitle('');
      setContent('');
      setMediaType('image');
      setMediaPreview('');
      setMediaFile(null);
      setMediaUrl('');
      setEmbedCode(''); // Clear embed code
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

        <label>Upload Media or Paste URL</label>
        <input type="file" onChange={handleFileChange} />
        <input
          type="text"
          placeholder="Paste media URL"
          value={mediaUrl}
          onChange={handleMediaUrlChange}
        />

        {mediaPreview && mediaType === 'image' && (
          <img src={mediaPreview} alt="Preview" className="media-preview" />
        )}
        {mediaType === 'video' && mediaUrl && embedCode && (
          <iframe
            src={embedCode}
            title="Video Preview"
            className="media-preview"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        )}

        <button type="submit">Create Blog</button>
      </form>
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default CreateBlog;
