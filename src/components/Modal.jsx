import React from 'react';
// import '../css/Modal.css';

const Modal = ({ campaign, onClose }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="modal-close" onClick={onClose}>
          &times;
        </span>
        <h2>{campaign.title}</h2>
        <img src={campaign.image} alt={campaign.title} className="modal-image" />
        <p>{campaign.fullDescription}</p>
        <button className="modal-donate-button">Donate Now</button>
      </div>
    </div>
  );
};

export default Modal;
