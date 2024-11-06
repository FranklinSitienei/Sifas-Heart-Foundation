import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar'; 
import Sidebar from './components/Sidebar'; 
import Dashboard from './components/Dashboard'; 
import Donations from './components/Donations';
import CreateBlog from './components/CreateBlog';
import AllBlogs from './components/AllBlogs';
import Login from './components/Login';
import Signup from './components/Signup';
import './App.css';
import Account from './components/Account';
import ChatMessages from './components/ChatMessages';
import ChatDetails from './components/ChatDetails';
import AdminBlogDetails from './components/AdminBlogDetails';

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    
    useEffect(() => {
        const token = localStorage.getItem('admin');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    return children;
};

const App = () => {
    return (
        <Router>
            <Navbar />
            <Sidebar />
            <div className="content">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/donations" element={<ProtectedRoute><Donations /></ProtectedRoute>} />
                    <Route path="/create-blog" element={<ProtectedRoute><CreateBlog /></ProtectedRoute>} />
                    <Route path="/all-blogs" element={<ProtectedRoute><AllBlogs /></ProtectedRoute>} />
                    <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                    <Route path="/chat" element={<ProtectedRoute><ChatMessages /></ProtectedRoute>} />
                    <Route path="/chat/details/:chatId" element={<ProtectedRoute><ChatDetails /></ProtectedRoute>} />
                    <Route path="/blog/:id" element={<ProtectedRoute><AdminBlogDetails /></ProtectedRoute>} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
