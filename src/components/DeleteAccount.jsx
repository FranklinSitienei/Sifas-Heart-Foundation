import React, { useState } from 'react';
import axios from 'axios';
import '../css/DeleteAccount.css';

const DeleteAccount = () => {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [reason, setReason] = useState('');
    const [otherReason, setOtherReason] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const token = localStorage.getItem('token');

    const handleDelete = async () => {
        if (!password || !email) {
            setError('Password and email are required');
            return;
        }

        try {
            const response = await axios.delete('http://localhost:5000/api/auth/delete_account', {
                headers: { 'Authorization': `Bearer ${token}` },
                data: { password, email, reason, otherReason }
            });
            setSuccess(response.data.msg);
            setPassword('');
            setEmail('');
            setReason('');
            setOtherReason('');
            handleLogout(); // Call handleLogout on successful deletion
        } catch (err) {
            setError(err.response?.data?.msg || 'Server error');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/'; // Redirect to the homepage or login page
    };

    return (
        <div className="delete-account">
            <h2 className="delete-account-title">Delete Account</h2>
            <input
                type="email"
                className="delete-account-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                className="delete-account-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <select
                className="delete-account-select"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
            >
                <option value="">Select Reason</option>
                <option value="TwoAccounts">Having Two Accounts</option>
                <option value="NeedsUpgrade">Needs Upgrade</option>
                <option value="Temporary">Temporarily Disabling</option>
                <option value="Other">Other</option>
            </select>
            {reason === 'Other' && (
                <textarea
                    className="delete-account-textarea"
                    placeholder="Please specify other reason"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                />
            )}
            <button className="delete-account-button" onClick={handleDelete}>Delete Account</button>
            {error && <p className="delete-account-error">{error}</p>}
            {success && <p className="delete-account-success">{success}</p>}
        </div>
    );
};

export default DeleteAccount;
