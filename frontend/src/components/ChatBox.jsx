import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { MdChat } from 'react-icons/md';
import { BsEmojiSmile } from 'react-icons/bs'; // Emoji icon
import { FaUserCircle } from 'react-icons/fa'; // Fallback profile icon
import '../css/ChatBox.css';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [adminDetails, setAdminDetails] = useState({});
  const [editMessageId, setEditMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState('');
  const [lastAutomaticMessageDate, setLastAutomaticMessageDate] = useState(null);
  const token = localStorage.getItem('token');
  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
      checkAdminStatus();
      addGreetingMessage();
    }
  }, [isOpen]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/chat/messages', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) throw new Error('Failed to fetch chat history');
  
      const chatData = await response.json();
      setMessages(chatData.messages || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/chat/admin-status');
      if (!response.ok) throw new Error('Failed to check admin status');
  
      const adminStatus = await response.json();
      setIsAdminOnline(adminStatus.isOnline);
      if (adminStatus.isOnline) {
        setAdminDetails(adminStatus.secretary);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const handleSend = async () => {
    if (message.trim()) {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/chat/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message }),
        });
  
        if (!response.ok) throw new Error('Failed to send message');
  
        const newMessage = await response.json();
        setMessages([...messages, newMessage]);
        setMessage('');
        setIsLoading(false);
      } catch (error) {
        console.error('Error sending message:', error);
        setIsLoading(false);
      }
    }
  };

  const handleEdit = async () => {
    if (editMessageText.trim()) {
      try {
        const response = await fetch('http://localhost:5000/api/chat/edit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messageId: editMessageId, newText: editMessageText }),
        });
  
        if (!response.ok) throw new Error('Failed to edit message');
  
        const result = await response.json();
        setMessages(messages.map(msg => (msg._id === editMessageId ? { ...msg, text: editMessageText } : msg)));
        setEditMessageId(null);
        setEditMessageText('');
      } catch (error) {
        console.error('Error editing message:', error);
      }
    }
  };

  const handleDelete = async (messageId) => {
    try {
      const response = await fetch('http://localhost:5000/api/chat/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageId }),
      });
  
      if (!response.ok) throw new Error('Failed to delete message');
  
      setMessages(messages.filter(msg => msg._id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const addGreetingMessage = () => {
    if (messages.length === 0) {
      const greetingMessage = { from: 'admin', text: 'Hello! How can I assist you today?', createdAt: new Date() };
      setMessages([greetingMessage]);
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessage(message + emoji);
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <>
      {isOpen && (
        <div className="chatbox">
          <div className="chatbox-header">
            <div className="chatbox-title">Chat</div>
            <button className="chatbox-close" onClick={() => setIsOpen(false)}>X</button>
          </div>
          <div className="chatbox-body" ref={chatBodyRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.from}`}>
                <div className="message-content">
                  <span>{msg.text}</span>
                  <span className="message-timestamp">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                {msg.from === 'user' && (
                  <div className="message-actions">
                    <button onClick={() => { setEditMessageId(msg._id); setEditMessageText(msg.text); }}>Edit</button>
                    <button onClick={() => handleDelete(msg._id)}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="chatbox-footer">
            {isAdminOnline && (
              <div className="admin-info">
                <img src={adminDetails.profilePicture || FaUserCircle} alt="Admin" className="admin-avatar" />
                <span>{adminDetails.firstName} {adminDetails.lastName} ({adminDetails.role})</span>
              </div>
            )}
            <input
              type="text"
              value={message}
              onChange={handleChange}
              placeholder="Type a message..."
            />
            <BsEmojiSmile className="emoji-icon" onClick={() => handleEmojiClick('😊')} />
            <button onClick={handleSend} disabled={isLoading}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
      <MdChat className="chatbox-icon" onClick={() => setIsOpen(!isOpen)} />
    </>
  );
};

export default ChatBox;
