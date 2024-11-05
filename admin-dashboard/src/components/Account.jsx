import React, { useEffect, useState } from 'react';
import { FaCamera, FaEye, FaEyeSlash } from 'react-icons/fa';
import '../css/Account.css';
// Commented out for later use
// import DeleteAccount from './DeleteAccount';

const Account = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [editProfile, setEditProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profilePicture: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const token = localStorage.getItem('admin');

  useEffect(() => {
    if (token) {
      fetch('https://sifas-heart-foundation-1.onrender.com/api/admin/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => { throw new Error(errorData.msg); });
        }
        return response.json();
      })
      .then(data => {
        setUserProfile(data);
        setEditProfile({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          profilePicture: data.profilePicture || '',
          password: '',
          confirmPassword: ''
        });
      })
      .catch(error => console.error('Error fetching user profile:', error.message));    
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditProfile(prevState => ({ ...prevState, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePictureFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditProfile(prevState => ({ ...prevState, profilePicture: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSave = () => {
    if (editProfile.password && !validatePassword(editProfile.password)) {
      alert('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    const formData = new FormData();
    formData.append('firstName', editProfile.firstName);
    formData.append('lastName', editProfile.lastName);
    formData.append('email', editProfile.email);
    formData.append('password', editProfile.password);
    formData.append('confirmPassword', editProfile.confirmPassword);
    if (profilePictureFile) {
      formData.append('profilePicture', profilePictureFile);
    }

    fetch('https://sifas-heart-foundation-1.onrender.com/api/admin/update_profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      setUserProfile(data);
      // Update editProfile state with the new data
      setEditProfile(prevState => ({ ...prevState, profilePicture: data.profilePicture }));
    })
    .catch(error => console.error('Error updating profile:', error));
  };

  if (!token) {
    return (
      <div className="profile-container">
        <h1 className="text-2xl font-bold">Please log in to view your profile</h1>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-details">
        <div className="profile-header flex items-center mb-8">
          <div className="profile-picture relative">
            {editProfile.profilePicture ? (
              <img
                src={editProfile.profilePicture}
                alt={editProfile.firstName}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200"></div>
            )}
            <label className="camera-icon">
              <FaCamera />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
              />
            </label>
          </div>
          <div className="ml-4 flex-grow">
            <input
              type="text"
              name="firstName"
              value={editProfile.firstName}
              onChange={handleInputChange}
              className="mb-4 p-2 border rounded w-full"
              placeholder="Enter your first name"
            />
            <input
              type="text"
              name="lastName"
              value={editProfile.lastName}
              onChange={handleInputChange}
              className="mb-4 p-2 border rounded w-full"
              placeholder="Enter your last name"
            />
          </div>
        </div>

        <div className="profile-info">
          <input
            type="email"
            name="email"
            value={editProfile.email}
            onChange={handleInputChange}
            className="mb-4 p-2 border rounded w-full"
            placeholder="Enter your email"
          />

          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={editProfile.password}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              placeholder="Enter your password"
            />
            <button onClick={toggleShowPassword} className="show-hide-icon">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="relative mb-4 bg-none">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={editProfile.confirmPassword}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
              placeholder="Confirm your password"
            />
            <button onClick={toggleShowConfirmPassword} className="show-hide-icon">
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          
          <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded mr-2" onClick={handleSave}>
            Save
          </button>
        </div>
        {/* Uncomment for later use */}
        {/* <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded mr-2" onClick={openDeleteModal}>
            Delete Account
          </button> */}
      </div>

      {/* Uncomment for later use */}
      {/* {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={closeDeleteModal}>X</button>
            <DeleteAccount />
          </div>
        </div>
      )} */}
    </div>
  );
};

export default Account;
