import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const PasswordSetup = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const location = useLocation();
    const token = new URLSearchParams(location.search).get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        const response = await fetch('https://sifas-heart-foundation.onrender.com/api/auth/password-setup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, password, confirmPassword }),
        });

        if (response.ok) {
            alert('Password setup successful');
        } else {
            alert('Password setup failed');
        }
    };

    return (
        <div className="password-setup-container">
            <div className="password-setup-card">
                <h2>Set Up Your Password</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="setup-button">
                        Set Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PasswordSetup;
