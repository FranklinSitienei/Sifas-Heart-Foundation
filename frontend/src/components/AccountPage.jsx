import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfilePage from './ProfilePage';
import Achievements from './Achievements';
import Leaderboard from './Leaderboard';
import Badges from './Badges';
import Notifications from './Notifications';
import '../css/AccountPage.css';

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  return(
    <div className="account-page">
      <div className="sidebar">
      <div className="sidebar-links">
        <button
          className={`sidebar-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`sidebar-button ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          Achievements
        </button>
        <button
          className={`sidebar-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </button>
        <button
          className={`sidebar-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
      </div>
      </div>
      <div className="content">
        {activeTab === 'profile' && <ProfilePage/>}
        {activeTab === 'achievements' && <Achievements/>}
        {activeTab === 'leaderboard' && <Leaderboard />}
        {activeTab === 'notifications' && <Notifications/>}
      </div>
    </div>
  )
};

export default AccountPage;
