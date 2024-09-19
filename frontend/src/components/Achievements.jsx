import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/Achievements.css";

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [latestAchievement, setLatestAchievement] = useState(null);
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://sifas-heart-foundation-2.onrender.com/api/auth/achievements", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { achievements } = response.data;
        setAchievements(achievements);
        if (achievements.length > 0) {
          setLatestAchievement(achievements[achievements.length - 1]);
        }
      } catch (error) {
        console.error("Error fetching achievements", error);
      }
    };

    fetchAchievements();

    const calculateProgress = () => {
      const totalAchievements = achievements.length;
      const newLevel = Math.floor(Math.sqrt(totalAchievements) + 1);
      const achievementsForCurrentLevel = Math.pow(newLevel - 1, 2);
      const levelProgress = totalAchievements - achievementsForCurrentLevel;
      const progressPercentage =
        (levelProgress /
          (Math.pow(newLevel, 2) - achievementsForCurrentLevel)) *
        100;

      setLevel(newLevel);
      setProgress(progressPercentage);
    };

    calculateProgress();
  }, [achievements]);

  const claimReward = () => {
    setLatestAchievement(null); // Hide the latest reward
  };

  return (
    <div className="achievements-container">
      <h1 className="text-3xl font-bold mb-6">Your Achievements</h1>

      {/* Level Progress Bar */}
      <div className="level-progress-bar">
        <h2>Level {level}</h2>
        <div className="bar-container">
          <div className="bar" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Latest Achievement Showcase */}
      {latestAchievement && (
        <div className="latest-achievement">
          <div className="flex items-center">
            <div className="icon">
              <img src={latestAchievement.icon} alt={latestAchievement.title} />
            </div>
            <div>
              <h2>{latestAchievement.title}</h2>
              <p>{latestAchievement.description}</p>
            </div>
          </div>
          <button
            onClick={claimReward}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Claim
          </button>
        </div>
      )}

      {/* Achievements Table */}
      <div className="table-container">
        <table className="achievement-table">
          <thead>
            <tr>
              <th>Icon</th>
              <th>Title</th>
              <th>Description</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {achievements.map((achievement, index) => (
              <tr key={achievement._id}>
                <td className="text-center">
                  <img src={achievement.icon} alt={achievement.title} />
                </td>
                <td>{achievement.title}</td>
                <td>{achievement.description}</td>
                <td>{new Date(achievement.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Achievements;
