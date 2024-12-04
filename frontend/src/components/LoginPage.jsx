import React, { useState } from 'react';
import '../css/Login.css';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [recoveryContact, setRecoveryContact] = useState('');
    const [showRecovery, setShowRecovery] = useState(false);

    // Handle login form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const response = await fetch('https://sifas-heart-foundation.onrender.com/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token); // Store JWT token in local storage
            window.location.href = '/donations'; // Redirect to donations page
        } else {
            const error = await response.json();
            alert(`Login failed: ${error.msg}`);
        }

        setLoading(false);
    };

    // Handle Google Login
    const handleGoogleLogin = async () => {
        try {
            window.location.href = 'https://sifas-heart-foundation.onrender.com/api/auth/google';
        } catch (error) {
            console.error('Error during Google login', error);
        }
    };

    // Handle password recovery form submission
    const handleRecoverySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const response = await fetch('https://sifas-heart-foundation.onrender.com/api/auth/recover', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contact: recoveryContact }), // Accept email or phone number
        });

        if (response.ok) {
            alert('A reset link has been sent to your email or phone number.');
            setRecoveryContact('');
            setShowRecovery(false);
            window.location.href = '/reset-password'; // Navigate to ResetPassword.jsx
        } else {
            const error = await response.json();
            alert(`Recovery failed: ${error.msg}`);
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Login</h2>
                {!showRecovery ? (
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <div className="password-input">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <span
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>
                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? <FaSpinner className="spinner" /> : 'Login'}
                        </button>
                        <div className="recover-link">
                            <button type="button" onClick={() => setShowRecovery(true)} className="button">
                                Forgot Password?
                            </button>
                        </div>
                        <div className="oauth-buttons">
                            <button type="button" onClick={handleGoogleLogin} className="google-button">
                                Login with Google
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleRecoverySubmit} className="recovery-form">
                        <div className="input-group">
                            <label>Enter your email or phone number</label>
                            <input
                                type="text"
                                value={recoveryContact}
                                onChange={(e) => setRecoveryContact(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="recover-button" disabled={loading}>
                            {loading ? <FaSpinner className="spinner" /> : 'Send Reset Link'}
                        </button>
                        <button type="button" onClick={() => setShowRecovery(false)} className="cancel-recovery">
                            Cancel
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
