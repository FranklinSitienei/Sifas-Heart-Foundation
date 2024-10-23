import React, { useState, useEffect } from "react";
import "../css/CookieBanner.css"; // Optional: For custom styles

const CookieBanner = () => {
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      setIsBannerVisible(true);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsBannerVisible(false);
  };

  if (!isBannerVisible) {
    return null;
  }

  return (
    <div className="cookie-banner">
      <p>
        We use cookies to enhance your browsing experience. By continuing to use
        this site, you accept our cookie policy.
      </p>
      <button onClick={handleAcceptCookies}>Accept</button>
    </div>
  );
};

export default CookieBanner;