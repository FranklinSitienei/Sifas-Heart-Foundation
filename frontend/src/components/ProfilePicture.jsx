import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa'; 
import '../css/ProfilePicture.css';

const ProfilePictureUpload = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        // Create a preview URL for the selected image
        if (selectedFile) {
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreview(objectUrl);
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/auth/upload-profile-picture', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                alert('Profile picture uploaded successfully');
                navigate('/account'); // Redirect to AccountPage
            } else {
                const error = await response.json();
                alert(`Failed to upload profile picture: ${error.message}`);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to upload profile picture');
        }
    };

    return (
        <div className="upload-container">
            <div className="upload-card">
                <div className="icon-container">
                    {preview ? (
                        <img src={preview} alt="Profile Preview" className="preview-image" />
                    ) : (
                        <FaUserCircle className="upload-icon" />
                    )}
                </div>
                <form onSubmit={handleSubmit} className="upload-form">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                        className="file-input"
                    />
                    <button type="submit" className="submit-button" disabled={!file}>
                        {preview ? 'Confirm Upload' : 'Upload Picture'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePictureUpload;
