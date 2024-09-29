import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/ChatDetails.css'; // Add your custom CSS here

const ChatDetails = ({ chatId }) => {
    const [messages, setMessages] = useState([]);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [userProfile, setUserProfile] = useState(null); // State to hold user profile

    useEffect(() => {
        const token = localStorage.getItem('admin'); // Fetch the admin token from local storage

        if (token && chatId) {
            fetchChatMessages(token, chatId);
        }
    }, [chatId]);

    const fetchChatMessages = async (token, chatId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/chat/admin/${chatId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setMessages(response.data.messages);
            // Fetch user profile if needed
        } catch (error) {
            console.error('Error fetching chat messages:', error.response?.data || error.message);
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
            fetchChatMessages(token, chatId); // Refresh the chat messages
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
            fetchChatMessages(token, chatId); // Refresh the chat messages
        } catch (error) {
            console.error('Error deleting message:', error.response?.data || error.message);
        }
    };

    return (
        <div className="chat-details-container">
            {userProfile && (
                <div className="user-profile">
                    <img src={userProfile.profilePicture || '/default-profile.png'} alt={`${userProfile.firstName} ${userProfile.lastName}`} className="user-profile-picture" />
                    <div className="user-info">
                        <p>{userProfile.firstName} {userProfile.lastName}</p>
                        <p className="user-status">{userProfile.isOnline ? 'Online' : `Last seen: ${new Date(userProfile.lastSeen).toLocaleString()}`}</p>
                    </div>
                </div>
            )}
            <div className="messages-container">
                {messages.map((message) => (
                    <div key={message._id} className={`message ${message.from === 'user' ? 'user-message' : 'admin-message'}`}>
                        {message.from === 'user' ? (
                            <div className="user-message-content">
                                <p>{message.text}</p>
                                <small>{new Date(message.createdAt).toLocaleTimeString()}</small>
                            </div>
                        ) : (
                            <div className="admin-message-content">
                                {editingMessageId === message._id ? (
                                    <div>
                                        <input
                                            type="text"
                                            value={editingText}
                                            onChange={(e) => setEditingText(e.target.value)}
                                        />
                                        <button onClick={() => handleEditMessage(message._id)}>Save</button>
                                    </div>
                                ) : (
                                    <div>
                                        <p>{message.text}</p>
                                        <small>{new Date(message.createdAt).toLocaleTimeString()}</small>
                                        <button onClick={() => { setEditingMessageId(message._id); setEditingText(message.text); }}>Edit</button>
                                        <button onClick={() => handleDeleteMessage(message._id)}>Delete</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatDetails;
