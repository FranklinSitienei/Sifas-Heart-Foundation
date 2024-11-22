import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Signup.css';
import { FaGoogle, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';

const Signup = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passwordValidations, setPasswordValidations] = useState({
        length: false,
        uppercase: false,
        number: false,
        specialChar: false,
        alphabetic: false,
    });
    const [showModal, setShowModal] = useState(false); // For password modal
    const [googleSignUpEmail, setGoogleSignUpEmail] = useState(''); // Email after Google sign-up

    const navigate = useNavigate();
    const location = useLocation();

    // Extract the token from the URL query parameters when redirected after Google sign-in
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {
            localStorage.setItem('token', token); // Save the token
            navigate('/'); // Redirect to the homepage
        }
        console.log("token:", token )
    }, [location, navigate]);

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        setPasswordValidations({
            length: value.length >= 8,
            uppercase: /[A-Z]/.test(value),
            number: /\d/.test(value),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
            alphabetic: /[a-zA-Z]/.test(value),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
    
        try {
            const response = await fetch('https://sifas-heart-foundation.onrender.com/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firstName, lastName, email, password, confirmPassword, mobileNumber }),
            });
    
            if (response.ok) {
                const data = await response.json();
                if (data.redirect) {
                    navigate(data.redirect); // Redirect to the existing profile
                } else {
                    localStorage.setItem('token', data.token); // Store the token
                    navigate('/upload-profile-picture');
                }
            } else {
                const error = await response.json();
                alert(`Signup failed: ${error.msg}`);
            }
        } catch (err) {
            console.error('Signup error:', err);
        }
    };
    
    const handleGoogleSignUp = () => {
        // Redirect to backend Google OAuth route
        window.open('https://sifas-heart-foundation.onrender.com/api/auth/google', '_self');
    };

    // Handle modal password creation after Google sign-up
    const handlePasswordModalSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('https://sifas-heart-foundation.onrender.com/api/auth/password-setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: googleSignUpEmail, password, confirmPassword }),
            });

            if (response.ok) {
                setShowModal(false); // Close the modal after password setup
                const data = await response.json();
                localStorage.setItem('token', data.token); // Save the token
                navigate('/account'); // Redirect to the account page
            } else {
                const error = await response.json();
                alert(`Password setup failed: ${error.msg}`);
            }
        } catch (err) {
            console.error('Password setup error:', err);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <h2>Sign Up</h2>
                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="name-group">
                        <div className="input-group">
                            <label>First Name *</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Last Name *</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Mobile Number *</label>
                        <input
                            type="text"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Password *</label>
                        <div className="password-input">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={handlePasswordChange}
                                required
                            />
                            <span
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <div className="password-requirements">
                            <p className={passwordValidations.length ? 'valid' : ''}>
                                • At least 8 characters
                            </p>
                            <p className={passwordValidations.uppercase ? 'valid' : ''}>
                                • At least one uppercase letter (A-Z)
                            </p>
                            <p className={passwordValidations.number ? 'valid' : ''}>
                                • At least one number (0-9)
                            </p>
                            <p className={passwordValidations.specialChar ? 'valid' : ''}>
                                • At least one special character (!@#$%^&*)
                            </p>
                            <p className={passwordValidations.alphabetic ? 'valid' : ''}>
                                • At least one alphabetic letter (A-Z, a-z)
                            </p>
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Confirm Password *</label>
                        <div className="password-input">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <span
                                className="toggle-password"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>
                    <button type="submit" className="signup-button">
                        Sign Up
                    </button>
                </form>
                <div className="oauth-buttons">
                    <button onClick={handleGoogleSignUp} className="google-button">
                        <FaGoogle className="oauth-icon" /> Sign Up with Google
                    </button>
                </div>
            </div>

            {/* Password Setup Modal */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Create Password</h2>
                        <form onSubmit={handlePasswordModalSubmit}>
                            <div className="input-group">
                                <label>Password *</label>
                                <div className="password-input">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={handlePasswordChange}
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
                            <div className="input-group">
                                <label>Confirm Password *</label>
                                <div className="password-input">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <span
                                        className="toggle-password"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                            </div>
                            <button type="submit" className="signup-button">
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Signup;
