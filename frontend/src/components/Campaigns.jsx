import React, { useState } from 'react';
import '../css/Campaigns.css';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    description: '',
    goalAmount: '',
    imageUrl: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCampaign({ ...newCampaign, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCampaigns([...campaigns, newCampaign]);
    setNewCampaign({
      title: '',
      description: '',
      goalAmount: '',
      imageUrl: ''
    });
  };

  return (
    <div className="campaigns-container">
      <h2 className="title">Create a New Campaign</h2>
      <form onSubmit={handleSubmit} className="campaign-form">
        <input
          type="text"
          name="title"
          value={newCampaign.title}
          onChange={handleInputChange}
          placeholder="Campaign Title"
          className="input"
          required
        />
        <textarea
          name="description"
          value={newCampaign.description}
          onChange={handleInputChange}
          placeholder="Campaign Description"
          className="textarea"
          rows="4"
          required
        />
        <input
          type="number"
          name="goalAmount"
          value={newCampaign.goalAmount}
          onChange={handleInputChange}
          placeholder="Goal Amount ($)"
          className="input"
          required
        />
        <input
          type="text"
          name="imageUrl"
          value={newCampaign.imageUrl}
          onChange={handleInputChange}
          placeholder="Image URL"
          className="input"
        />
        <button type="submit" className="submit-button">
          Create Campaign
        </button>
      </form>

      <h2 className="title mt-8">Active Campaigns</h2>
      <div className="campaigns-list">
        {campaigns.map((campaign, index) => (
          <div key={index} className="campaign-card">
            <img src={campaign.imageUrl} alt={campaign.title} className="campaign-image"/>
            <h3 className="campaign-title">{campaign.title}</h3>
            <p className="campaign-description">{campaign.description}</p>
            <p className="campaign-goal">Goal: ${campaign.goalAmount}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Campaigns;
