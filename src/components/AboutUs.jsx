import React from 'react';
import '../css/AboutUs.css';
import StaffSlider from './StaffSlider';
import partner1 from '../images/CAT.png';
import partner2 from '../images/PlayStation.png';
import partner3 from '../images/Adidas.png';
import partner4 from '../images/Redbull.png';

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <section className="about-us-section">
        <h1>Who We Are</h1>
        <p>Sifa's Heart Foundation aims to empower survivors to heal, rebuild, and thrive through the establishment of a safe haven by fundraising $15.6 million. This aims to offer shelter, medical assistance, counseling, vocational training, education, livelihood support, community empowerment programs, and legal assistance.</p>
      </section>

      <section className="about-us-section">
        <h2>Vision</h2>
        <p>Envision a world where women and children affected by violence have access to comprehensive support to enable them to heal and empower them by giving them back their dignity.</p>
      </section>

      <section className="about-us-section">
        <h2>Mission</h2>
        <p>Remake is dedicated to empowering survivors to heal, rebuild, and thrive through the establishment of a safe haven and holistic care center. We aim to offer shelter, medical assistance, counseling, vocational training, education, livelihood support, community empowerment programs, and legal assistance.</p>
      </section>

      <section className="about-us-section">
        <h2>Strategic Plan</h2>
        <ul className="bullet-list">
          <li>Organize a bicycle tour in some of the East African countries to spread awareness.</li>
          <li>Organize a football tournament in which we are going to sell supporters' tickets.</li>
          <li>Spread awareness on social media by live-streaming our tour from Nairobi to Kinshasa.</li>
        </ul>
      </section>

      <section className="about-us-section">
        <h2>Where We Work</h2>
        <p>Kenya, Tanzania, Burundi, and the Democratic Republic of Congo.</p>
      </section>

      <section className="about-us-section">
        <h2>What We Do</h2>
        <p>We support vulnerable women and children globally by providing a safe space for them.</p>
      </section>

      <section className="about-us-section">
        <h2>Inspiration</h2>
        <p>Sifa's Heart Foundation is a dream put into reality by a young lady called Tropexcel Sifa Wahu Wambui. Born to a Congolese father and a Kenyan mother, Sifa has been researching and witnessing the violence, massacres, rapes, and wars in the Eastern DRC. Having a parent from the same region, she is inspired to visit her country and help where she can by establishing a safe haven. The safe haven will provide shelter, medical assistance, education, vocational training, livelihood support, community empowerment programs, and legal assistance.</p>
        <p>To raise awareness and fundraise, Sifa has come up with unique and interactive activities like football tournaments and cultural shows. Additionally, Sifa and her team will raise more awareness by cycling across Kenya and other Eastern African countries that are currently supporting and collaborating with her.</p>
      </section>

      <section className="about-us-section">
        <h2>Tropexcel Sifa's Message</h2>
        <p>"Let us all join hands and help our vulnerable brothers and sisters back in my motherland, DRC. A dollar each can save a life."</p>
      </section>

      <section className="about-us-section">
        <h2>Project Goals and Objectives</h2>
        <ul className="bullet-list">
          <li>To help vulnerable women and children affected by wars.</li>
          <li>Develop unity and good relations between countries in the region.</li>
          <li>Aid people in critical conditions in different parts of Africa.</li>
          <li>Establish a modern center that will offer shelter, medical assistance, education, vocational training, livelihood support, community empowerment programs, and legal assistance.</li>
        </ul>
      </section>

      <section className="about-us-section">
        <h2>Meet Our Staff</h2>
        <StaffSlider /> {/* This will display the staff slider similar to the committee slider on the homepage */}
      </section>

      <section className="about-us-section partners-section">
        <h2>Our Partners</h2>
        <div className="partners-flex">
          <div className="partner">
            <img src={partner1} alt="Otto Benecker" />
            <p>Otto Benecker</p>
          </div>
          <div className="partner">
            <img src={partner2} alt="Radio la Bouche" />
            <p>Radio la Bouche</p>
          </div>
          <div className="partner">
            <img src={partner3} alt="Congolese Diaspora in Kenya" />
            <p>Congolese Diaspora in Kenya</p>
          </div>
          <div className="partner">
            <img src={partner4} alt="Lyamba TV" />
            <p>Lyamba TV</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
