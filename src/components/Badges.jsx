import React from 'react';

const Badges = ({ badges }) => {
  return (
    <div className="p-8 max-w-lg mx-auto">
      <h2 className="text-xl font-bold">Badges</h2>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {badges.map(badge => (
          <div key={badge._id} className="p-4 border rounded-lg text-center">
            <img src={badge.icon} alt={badge.title} className="mx-auto w-12 h-12 mb-2"/>
            <span>{badge.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Badges;
