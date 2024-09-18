import React from 'react';
import staff1 from '../images/profile1.jpeg';
import staff2 from '../images/profile2.jpeg';
import staff3 from '../images/profile3.jpeg';
import staff4 from '../images/profile3.jpeg';
import '../css/StaffSlider.css';

const StaffSlider = () => {
  const staffMembers = [staff1, staff2, staff3, staff4];

  return (
    <div className="staff-slider">
      {staffMembers.map((member, index) => (
        <div key={index} className="staff-member">
          <img src={member} alt={`Staff ${index + 1}`} className='img'/>
        </div>
      ))}
    </div>
  );
};

export default StaffSlider;
