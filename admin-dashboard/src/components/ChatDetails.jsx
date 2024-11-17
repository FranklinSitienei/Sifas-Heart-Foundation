import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { HiOutlineEllipsisVertical } from 'react-icons/hi2';
import { MdVerified } from 'react-icons/md';
import '../css/ChatDetails.css';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('https://sifas-heart-foundation-1.onrender.com');

const ChatDetails = () => {
    const { chatId } = useParams();
    const [messages, setMessages] = useState([]);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [userProfile, setUserProfile] = useState(null);
    const [replyText, setReplyText] = useState('');
    const messagesEndRef = useRef(null); // Ref for auto-scrolling
    const token = localStorage.getItem('admin');

    useEffect(() => {
        if (token && chatId) {
            fetchChatDetails(token, chatId);
        }
    }, [chatId, token]);    

    const fetchChatDetails = async (token, chatId) => {
        if (!token) {
            console.error('Authorization token is missing.');
            return;
        }
        try {
            const response = await axios.get(`https://sifas-heart-foundation-1.onrender.com/api/chat/admin/${chatId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setMessages(response.data.messages);
            setUserProfile(response.data.user);
            scrollToBottom(); // Scroll to the bottom on load
        } catch (error) {
            console.error('Error fetching chat details:', error.response?.data || error.message);
        }
    };
    
    useEffect(() => {
        fetchChatDetails();
    
        // Listen for new messages from the user
        socket.on('message', (newMessage) => {
          if (newMessage.chatId === chatId) {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          }
        });
    
        // Listen for admin replies
        socket.on('adminReply', (reply) => {
          if (reply.chatId === chatId) {
            setMessages((prevMessages) => [...prevMessages, reply]);
          }
        });
    
        // Listen for message edits
        socket.on('messageEdited', (editedMessage) => {
          setMessages((prevMessages) => {
            return prevMessages.map(msg => 
              msg._id === editedMessage.messageId ? { ...msg, text: editedMessage.newText } : msg
            );
          });
        });
    
        // Listen for message deletions
        socket.on('messageDeleted', (deletedMessage) => {
          setMessages((prevMessages) => prevMessages.filter(msg => msg._id !== deletedMessage.messageId));
        });
    
        return () => {
          socket.off('message');
          socket.off('adminReply');
          socket.off('messageEdited');
          socket.off('messageDeleted');
        };
      }, [chatId]);
    
      useEffect(() => {
        // Emit that the admin is online when the chat details page is opened
        socket.emit('adminOnline', { chatId });
    
        return () => {
          // Emit that the admin is offline when the chat details page is closed
          socket.emit('adminOffline', { chatId });
        };
      }, [chatId]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom(); // Scroll to bottom when messages change
    }, [messages]);

    const handleReplyMessage = async () => {
        const token = localStorage.getItem('admin');
        try {
            await axios.post(`https://sifas-heart-foundation-1.onrender.com/api/chat/admin/reply/${chatId}`, { message: replyText }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setReplyText(''); // Clear input field after sending
            fetchChatDetails(token, chatId); // Refresh chat messages
        } catch (error) {
            console.error('Error sending reply:', error.response?.data || error.message);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    const handleEditMessage = async (messageId) => {
        try {
            await axios.post(`https://sifas-heart-foundation-1.onrender.com/api/chat/admin/edit/${chatId}`, { messageId, newText: editingText }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setEditingMessageId(null);
            setEditingText('');
            fetchChatDetails(token, chatId);
        } catch (error) {
            console.error('Error editing message:', error.response?.data || error.message);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await axios.post(`https://sifas-heart-foundation-1.onrender.com/api/chat/admin/delete/${chatId}`, { messageId }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            fetchChatDetails(token, chatId);
        } catch (error) {
            console.error('Error deleting message:', error.response?.data || error.message);
        }
    };

    const handleCopyMessage = (text) => {
        navigator.clipboard.writeText(text);
        alert('Message copied to clipboard!');
    };

    return (
        <div className="chat-details-container">
            {/* User Profile at Top Left */}
            {userProfile && (
                <div className="user-profile">
                    <img src={userProfile.profilePicture || '/default-profile.png'} alt={`${userProfile.firstName} ${userProfile.lastName}`} className="user-profile-picture" />
                    <div className="user-info">
                        <p>{userProfile.firstName} {userProfile.lastName}</p>
                        <p className="user-status">{userProfile.isOnline ? 'Online' : `Last seen: ${new Date(userProfile.lastSeen).toLocaleString()}`}</p>
                    </div>
                </div>
            )}

            {/* Messages Container */}
            <div className="messages-container">
                {messages.map((message, index) => (
                    <div key={message._id}>
                        {/* Display date separators */}
                        {index === 0 || formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt) ? (
                            <div className="date-separator">{formatDate(message.createdAt)}</div>
                        ) : null}

                        <div className={`message ${message.from}`}>
                            <div className="message-header">
                                <span className="message-user-name">
                                    {message.from === 'user'
                                        ? `${userProfile.firstName} ${userProfile.lastName}`
                                        : 'Admin'
                                    }
                                    {message.from === 'admin' && (
                                        <>
                                            <MdVerified className="verified-icon" />
                                            <span className="admin-label">Creator</span>
                                        </>
                                    )}
                                </span>
                                <HiOutlineEllipsisVertical className="options-icon" />
                                {/* Dropdown Menu for Edit/Delete/Copy */}
                                <div className="dropdown-menu">
                                    <button onClick={() => { setEditingMessageId(message._id); setEditingText(message.text); }}>Edit</button>
                                    <button onClick={() => handleDeleteMessage(message._id)}>Delete</button>
                                    <button onClick={() => handleCopyMessage(message.text)}>Copy</button>
                                </div>
                            </div>
                            {editingMessageId === message._id ? (
                                <div className="edit-message">
                                    <input
                                        type="text"
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                    />
                                    <button onClick={() => handleEditMessage(message._id)}>Save</button>
                                </div>
                            ) : (
                                <div className="message-content">
                                    <p>{message.text}</p>
                                    <small className="message-timestamp">{new Date(message.createdAt).toLocaleTimeString()}</small>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} /> {/* For auto-scrolling */}
            </div>

            {/* Reply Input */}
            <div className="reply-container">
                <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                />
                <button onClick={handleReplyMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatDetails;
