import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const ResetPassword = () => {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleReset = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            return setMessage('Passwords do not match');
        }

        const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword, confirmPassword }),
        });

        const data = await response.json();
        if (response.ok) {
            setMessage('Password reset successful. You can now log in.');
        } else {
            setMessage(data.msg || 'Error resetting password');
        }
    };

    return (
        <div className="reset-container">
            <form onSubmit={handleReset} className="reset-form">
                <h2>Reset Password</h2>
                <div className="input-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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
                <button type="submit" className="reset-button">Reset Password</button>
                {message && <p>{message}</p>}
            </form>
        </div>
    );
};

export default ResetPassword;
