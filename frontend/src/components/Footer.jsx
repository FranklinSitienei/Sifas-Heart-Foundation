import React from 'react';
import '../css/Footer.css';
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Company Locations */}
        <div className="footer-column">
          <h4>Company Name:</h4>
          <p>Remake Project</p>
          <p>P.O. Box 12345</p>
          <p>Nairobi, Kenya</p>
        </div>

        {/* Navbar Links */}
        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li>
              <span>&gt;</span>
              <a href="/about" className="footer-link">About Us</a>
            </li>
            <li>
              <span>&gt;</span>
              <a href="/contact" className="footer-link">Contact Us</a>
            </li>
            <li>
              <span>&gt;</span>
              <a href="/faq" className="footer-link">FAQ</a>
            </li>
          </ul>
        </div>

        {/* Social Media Links */}
        <div className="footer-column">
          <h4>Contact Us</h4>
          <ul className="footer-socials">
            <li><FaFacebook className="social-icon" /> <a href="https://www.facebook.com/@remakeproject" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><FaInstagram className="social-icon" /> <a href="https://www.instagram.com/remake_project254" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><FaTiktok className="social-icon" /> <a href="https://www.tiktok.com/@remake221" target="_blank" rel="noopener noreferrer">TikTok</a></li>
            <li><FaYoutube className="social-icon" /> <a href="https://www.youtube.com/@Re-makeProject" target="_blank" rel="noopener noreferrer">YouTube</a></li>
            <li><FaTwitter className="social-icon" /> <a href="https://twitter.com/@remakeproj254" target="_blank" rel="noopener noreferrer">X</a></li>
          </ul>
        </div>

        {/* Feedback Form */}
        <div className="footer-column">
          <h4>Send Us Your Feedback</h4>
          <form>
            <input type="text" placeholder="Your Name" required className='input'/>
            <input type="email" placeholder="Your Email" required className='input'/>
            <textarea placeholder="Your Feedback" rows="4" required className='input'></textarea>
            <button type="submit" className="cta-button">Send</button>
          </form>
        </div>
      </div>

      <div className="footer-copyright">
        <p>&copy; {new Date().getFullYear()} Remake Project. All rights reserved.</p>
        <p>Designed by Franklin Sitienei</p>
      </div>
    </footer>
  );
};

export default Footer;
