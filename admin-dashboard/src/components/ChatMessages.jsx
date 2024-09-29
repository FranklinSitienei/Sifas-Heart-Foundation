// ChatMessages.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/ChatMessages.css';
import { useNavigate } from 'react-router-dom';

const ChatMessages = () => {
    const [chats, setChats] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [userProfile, setUserProfile] = useState(null); // State to hold admin profile
    const history = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('admin'); // Fetch the admin token from local storage

        if (token) {
            fetchProfile(token); // Fetch the profile if the token exists
            fetchChats(token); // Fetch chat messages with token
        }
    }, []);

    const fetchProfile = async (token) => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg);
            }

            const data = await response.json();
            setUserProfile(data);
        } catch (error) {
            console.error('Error fetching admin profile:', error.message);
        }
    };

    const fetchChats = async (token) => {
        try {
            const response = await axios.get('http://localhost:5000/api/chat/admin/all', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            console.log('Fetched chats:', response.data); // Debug log
            setChats(response.data);
        } catch (error) {
            console.error('Error fetching chats:', error.response?.data || error.message);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const token = localStorage.getItem('admin');

        try {
            await axios.post('http://localhost:5000/api/chat/admin/send', { message: newMessage }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setNewMessage('');
            fetchChats(token); // Refresh the chat messages
        } catch (error) {
            console.error('Error sending message:', error.response?.data || error.message);
        }
    };

    const handleEditMessage = async (messageId) => {
        const token = localStorage.getItem('admin');

        try {
            await axios.post('http://localhost:5000/api/chat/admin/edit', { messageId, newText: editingText }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setEditingMessageId(null);
            setEditingText('');
            fetchChats(token); // Refresh the chat messages
        } catch (error) {
            console.error('Error editing message:', error.response?.data || error.message);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        const token = localStorage.getItem('admin');

        try {
            await axios.post('http://localhost:5000/api/chat/admin/delete', { messageId }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            fetchChats(token); // Refresh the chat messages
        } catch (error) {
            console.error('Error deleting message:', error.response?.data || error.message);
        }
    };

    const navigateToChatView = (chatId) => {
        history('/chat/details');
    };

    return (
        <div className="chat-container">
            <h2>Chat Messages</h2>
            {userProfile && (
                <div className="admin-profile">
                    {userProfile.profilePicture ? (
                        <img src={userProfile.profilePicture} alt={`${userProfile.firstName} ${userProfile.lastName}`} className="admin-profile-picture" />
                    ) : (
                        <div className="admin-placeholder-picture"></div>
                    )}
                    <p>Logged in as: {userProfile.firstName} {userProfile.lastName}</p>
                </div>
            )}
            <div className="chat-box">
                {chats.length === 0 ? (
                    <p>No chats available.</p>
                ) : (
                    chats.map((chat) => (
                        <div 
                            key={chat._id} 
                            className="chat-message" 
                            onClick={() => navigateToChatView(chat._id)}
                            style={{ cursor: 'pointer' }}
                        >
                            {chat.userId ? (
                                <div className="chat-header">
                                    {chat.userId.profilePicture ? (
                                        <img src={chat.userId.profilePicture} alt={`${chat.userId.firstName} ${chat.userId.lastName}`} className="user-profile-picture" />
                                    ) : (
                                        <div className="user-placeholder-picture"></div>
                                    )}
                                    <div>
                                        <strong>{chat.userId.firstName} {chat.userId.lastName}</strong>
                                        <p>{chat.messages[chat.messages.length - 1]?.text || "No messages yet."}</p>
                                        <small>{new Date(chat.lastActive).toLocaleString()}</small>
                                    </div>
                                </div>
                            ) : (
                                <p>User information not available.</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );

};

export default ChatMessages;
