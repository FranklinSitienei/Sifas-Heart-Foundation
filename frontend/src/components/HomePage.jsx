import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/HomePage.css';
import Children from '../images/children.jpeg';
import Family from '../images/Children.jpg';
import Victims from '../images/victims.jpg';
import Water from '../images/water.jpeg';
import Students from '../images/students.jpeg';
import CleanWater from '../images/clean.jpeg';
import Profile1 from '../images/CEO.jpg';
import Profile2 from '../images/profile2.jpeg';
import Profile3 from '../images/profile3.jpeg';

const HomePage = () => {
  const [modalContent, setModalContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageClick = (content) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Make a Difference Today</h1>
        <p className="hero-description">
          Join us in supporting children and families in need. Your donations can change lives.
        </p>
        <Link to="/donations" className="hero-button">
          Donate Now
        </Link>
      </section>

      {/* Donation Cards */}
      <section className="donation-cards">
        <div className="donation-card" onClick={() => handleImageClick("Support Children's Welfare: Help us provide food to children in underserved war communities.")}>
          <img src={Children} alt="Children Donation" />
          <div className="donation-card-content">
            <h3 className="donation-card-title">Support Children's Welfare</h3>
            <p className="donation-card-description">
              Help us provide food to children in underserved war communities.
            </p>
            <Link to="/donations" className="donation-card-button">Donate</Link>
          </div>
        </div>

        <div className="donation-card" onClick={() => handleImageClick("Support War Survivors: Your donation can provide food and essential services to suffering lives.")}>
          <img src={Family} alt="Family Donation" />
          <div className="donation-card-content">
            <h3 className="donation-card-title">Support War Survivors</h3>
            <p className="donation-card-description">
              Your donation can provide food, and essential services to the suffering lives.
            </p>
            <Link to="/donations" className="donation-card-button">Donate</Link>
          </div>
        </div>
      </section>

      {/* Organization Committee */}
      <section className="committee-section">
        <h2 className="committee-title">Meet Our Organization Committee</h2>
        <div className="committee-cards">
          <div className="committee-card">
            <img src={Profile1} alt="Committee Member" />
            <h4 className="committee-card-name">Tropexcel Wahu Wambui</h4>
            <p className="committee-card-role">Founder & CEO</p>
          </div>

          <div className="committee-card">
            <img src={Profile2} alt="Committee Member" />
            <h4 className="committee-card-name">Jane Smith</h4>
            <p className="committee-card-role">Chief Operations Officer</p>
          </div>

          {/* <div className="committee-card">
            <img src={Profile3} alt="Committee Member" />
            <h4 className="committee-card-name">Emily Johnson</h4>
            <p className="committee-card-role">Head of Fundraising</p>
          </div> */}
        </div>
      </section>

      {/* Active Campaigns Section */}
      <section className="active-campaigns">
        <div className="campaign-card" onClick={() => handleImageClick("Build a School in Africa: Help us raise funds to build a school in a remote village in Africa.")}>
          <img src={Victims} alt="Campaign 1" />
          <div className="campaign-card-content">
            <h3 className="campaign-card-title">The survivors of Congo</h3>
            <p className="campaign-card-description">
              We hope that you will donate to help this survivors of war.
            </p>
            <Link to="/donations" className="campaign-card-button">Donate</Link>
          </div>
        </div>

        {/* <div className="campaign-card" onClick={() => handleImageClick("Provide Clean Water: Your donation can bring clean drinking water to communities in need.")}>
          <img src={Water} alt="Campaign 2" />
          <div className="campaign-card-content">
            <h3 className="campaign-card-title">Provide Clean Water</h3>
            <p className="campaign-card-description">
              Your donation can bring clean drinking water to communities in need.
            </p>
            <button className="campaign-card-button">
            <Link to="/donations">Donate</Link>
            </button>
          </div>
        </div> */}
      </section>

      {/* School and Water Section */}
      {/* <section className="school-water-section">
        <div className="school-water-card" onClick={() => handleImageClick("Building Schools: Contribute to the construction of schools in underserved areas.")}>
          <img src={Students} alt="School" />
          <h3 className="school-water-card-title">Building Schools</h3>
          <p>Contribute to the construction of schools in underserved areas.</p>
        </div>

        <div className="school-water-card" onClick={() => handleImageClick("Providing Clean Water: Help us provide clean and safe drinking water to those in need.")}>
          <img src={CleanWater} alt="Clean Water" />
          <h3 className="school-water-card-title">Providing Clean Water</h3>
          <p>Help us provide clean and safe drinking water to those in need.</p>
        </div>
      </section> */}

      {/* Call-to-Action Section */}
      <section className="cta-section">
        <h2 className="cta-title">Start Donating</h2>
        <p className="cta-description">
          Have a cause you're passionate about? Start donating and raise funds to make a difference.
        </p>
        <Link to="/donations" className="cta-button">Donate</Link>
      </section>

      {/* Modal for Detailed Information */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Details</h2>
            <p>{modalContent}</p>
            <button onClick={closeModal} className="modal-close-button">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
