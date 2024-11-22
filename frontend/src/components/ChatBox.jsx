import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { MdChat } from 'react-icons/md';
import { BsEmojiSmile } from 'react-icons/bs';
import { FaUserCircle } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import '../css/ChatBox.css';
import io from 'socket.io-client';

const socket = io('https://sifas-heart-foundation.onrender.com');

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [adminDetails, setAdminDetails] = useState({});
  const [editMessageId, setEditMessageId] = useState(null);
  const [emojiList, setEmojiList] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const token = localStorage.getItem('token');
  const chatBodyRef = useRef(null);

  useEffect(() => {
    socket.on('message', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on('messageEdited', (updatedMessage) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
    });

    socket.on('messageDeleted', (deletedMessageId) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== deletedMessageId)
      );
    });

    socket.on('adminOnline', ({ adminId }) => {
      setIsAdminOnline(true);
    });

    socket.on('adminOffline', ({ adminId }) => {
      setIsAdminOnline(false);
    });

    return () => {
      socket.off('message');
      socket.off('messageEdited');
      socket.off('messageDeleted');
      socket.off('adminOnline');
      socket.off('adminOffline');
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
      checkAdminStatus();
      addGreetingMessage();
      setUserOnline();
    } else {
      setUserOffline();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (isOpen) {
        setUserOffline();
      }
    };
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchEmojis = async () => {
    try {
      const response = await fetch('https://sifas-heart-foundation.onrender.com/api/emoji/emojis');
      if (!response.ok) throw new Error('Failed to fetch emojis');
      const emojis = await response.json();
      setEmojiList(emojis);
    } catch (error) {
      console.error('Error fetching emojis:', error);
    }
  };

  const setUserOnline = async () => {
    try {
      const response = await fetch('https://sifas-heart-foundation.onrender.com/api/chat/user/online', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error setting user online:', error);
      alert("There was an issue setting the user status to online. Please try again.");
    }
  };
  
  const setUserOffline = async () => {
    try {
      const response = await fetch('https://sifas-heart-foundation.onrender.com/api/chat/user/offline', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error setting user offline:', error);
      alert("There was an issue setting the user status to offline. Please try again.");
    }
  };  

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch('https://sifas-heart-foundation.onrender.com/api/chat/messages', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const chatData = await response.json();
      setMessages(chatData.messages || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('https://sifas-heart-foundation.onrender.com/api/chat/secretary-status', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const adminStatus = await response.json();
      setIsAdminOnline(adminStatus.isOnline);
      if (adminStatus.isOnline) {
        setAdminDetails(adminStatus.secretary);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      alert("There was an issue checking the admin status.");
    }
  };


  const handleSend = async () => {
    if (message.trim()) {
      setIsLoading(true);
      try {
        if (editMessageId) {
          await handleEdit();
        } else {
          const response = await fetch('https://sifas-heart-foundation.onrender.com/api/chat/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message }),
          });

          const newMessage = await response.json();
          socket.emit('message', newMessage);
        }

        setMessage('');
        setEditMessageId(null);
        setIsLoading(false);
      } catch (error) {
        console.error('Error sending message:', error);
        setIsLoading(false);
      }
    }
  };

  const handleEdit = async () => {
    try {
      const response = await fetch('https://sifas-heart-foundation.onrender.com/api/chat/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageId: editMessageId, newText: message }),
      });

      const updatedMessage = await response.json();
      socket.emit('messageEdited', updatedMessage);

      setEditMessageId(null);
      setMessage('');
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await fetch('https://sifas-heart-foundation.onrender.com/api/chat/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageId }),
      });

      socket.emit('messageDeleted', messageId);
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

  const handleEmojiClick = (emojiSymbol) => {
    setMessage(message + emojiSymbol);
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <>
      {isOpen && (
        <div className="chatbox">
          <div className="chatbox-header">
            <div className="chatbox-title">
              {isAdminOnline && (
                <div className="admin-info">
                  <div className="admin-profile">
                    <img src={adminDetails.profilePicture || FaUserCircle} alt="Admin" className="admin-avatar" />
                    <div className="admin-name">
                      <span>{adminDetails.firstName} {adminDetails.lastName}</span>
                      <MdVerified className="verified-icon" />
                    </div>
                  </div>
                  <div className="admin-status">
                    {isAdminOnline ? <span>Online</span> : <span>Offline</span>}
                  </div>
                </div>
              )}
            </div>
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
                    <button onClick={() => { setEditMessageId(msg._id); setMessage(msg.text); }}>Edit</button>
                    <button onClick={() => handleDelete(msg._id)}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="chatbox-footer">

            <input
              type="text"
              value={message}
              onChange={handleChange}
              placeholder={editMessageId ? 'Edit your message...' : 'Type a message...'}
            />
            <BsEmojiSmile className="emoji-icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
            <FaPaperPlane className="send-icon" onClick={handleSend} />
          </div>
        </div>
      )}
      <MdChat onClick={() => setIsOpen(!isOpen)} className="chatbox-icon" />
    </>
  );
};

export default ChatBox;
