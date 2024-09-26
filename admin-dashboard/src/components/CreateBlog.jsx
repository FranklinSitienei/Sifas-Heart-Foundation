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
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('mediaType', mediaType);

    if (mediaFile) {
      formData.append('media', mediaFile);
    } else if (mediaUrl) {
      formData.append('mediaUrl', mediaUrl);
    }

    try {
      const token = localStorage.getItem('admin');
      await axios.post('http://localhost:5000/api/blog/create', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      alert('Blog created successfully!');
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
          onChange={(e) => setMediaUrl(e.target.value)}
        />

        {mediaPreview && mediaType === 'image' && (
          <img src={mediaPreview} alt="Preview" className="media-preview" />
        )}
        {mediaType === 'video' && mediaUrl && (
          <iframe
            src={mediaUrl}
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
