import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/ChatMessages.css';

const ChatMessages = () => {
    const [chats, setChats] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [userProfile, setUserProfile] = useState(null); // State to hold user profile

    useEffect(() => {
        const token = localStorage.getItem('admin'); // Fetch the admin token from local storage

        if (token) {
            fetchProfile(token); // Fetch the profile if the token exists
        }

        fetchChats(); // Fetch chat messages
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
            console.error('Error fetching user profile:', error.message);
        }
    };

    const fetchChats = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/chat/admin/all');
            setChats(response.data);
        } catch (error) {
            console.error('Error fetching chats:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage) return;

        try {
            await axios.post('http://localhost:5000/api/chat/admin/send', { message: newMessage });
            setNewMessage('');
            fetchChats(); // Refresh the chat messages
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleEditMessage = async (messageId) => {
        try {
            await axios.post('http://localhost:5000/api/chat/admin/edit', { messageId, newText: editingText });
            setEditingMessageId(null);
            setEditingText('');
            fetchChats(); // Refresh the chat messages
        } catch (error) {
            console.error('Error editing message:', error);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await axios.post('http://localhost:5000/api/chat/admin/delete', { messageId });
            fetchChats(); // Refresh the chat messages
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    return (
        <div className="chat-container">
            <h2>Chat Messages</h2>
            {userProfile && <p>Logged in as: {userProfile.firstName} {userProfile.lastName}</p>}
            <div className="chat-box">
                {chats.map((chat) => (
                    <div key={chat._id} className="chat-message">
                        <p>{chat.userId.firstName}: {chat.messages[chat.messages.length - 1].text}</p>
                        <div className="chat-actions">
                            <button onClick={() => { setEditingMessageId(chat.messages[chat.messages.length - 1]._id); setEditingText(chat.messages[chat.messages.length - 1].text); }}>
                                Edit
                            </button>
                            <button onClick={() => handleDeleteMessage(chat.messages[chat.messages.length - 1]._id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {editingMessageId ? (
                <div className="edit-message">
                    <input 
                        value={editingText} 
                        onChange={(e) => setEditingText(e.target.value)} 
                        placeholder="Edit message"
                    />
                    <button onClick={() => handleEditMessage(editingMessageId)}>Save</button>
                </div>
            ) : (
                <div className="new-message">
                    <input 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                        placeholder="Type your message..."
                    />
                    <button onClick={handleSendMessage}>Send</button>
                </div>
            )}
        </div>
    );
};

export default ChatMessages;
