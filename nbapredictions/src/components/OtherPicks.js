// src/components/OtherPicks.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router
import './OtherPicks.css';

function OtherPicks() {
  const [userPicks, setUserPicks] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const navigate = useNavigate(); // For navigating to other pages

  // Fetch picks from Firestore
  useEffect(() => {
    const fetchUserPicks = async () => {
      const picksCollection = collection(db, 'userPicks');
      const picksSnapshot = await getDocs(picksCollection);

      const picksList = picksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserPicks(picksList);
    };

    fetchUserPicks();
  }, []);

  // Fetch profile pictures from Firestore
  useEffect(() => {
    const fetchUserProfiles = async () => {
      const profilesCollection = collection(db, 'userProfiles');
      const profilesSnapshot = await getDocs(profilesCollection);

      const profilesMap = {};
      profilesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        profilesMap[data.username] = data.profilePicUrl; // Store profilePicUrl with username as the key
      });

      setUserProfiles(profilesMap);
    };

    fetchUserProfiles();
  }, []);

  // Handle clicking on a user's name
  const handleUserClick = (userId) => {
    // Navigate to the user's picks page
    navigate(`/picks/${userId}`);
  };

  const getDisplayName = (username) => {
    if (!username) return ''; // If username is undefined or null, return an empty string
    return username.replace('@example.com', '');
  };

  return (
    <div className="other-picks-box">
      <h2>Other Accounts' Picks</h2>
      <div className="user-picks-list">
        {userPicks.map((userPick, index) => (
          <div
            key={index}
            className="user-pick-card"
            onClick={() => handleUserClick(userPick.id)}
          >
            {/* Fetch and display profile picture from userProfiles using username */}
            {userProfiles[userPick.username] && (
              <img
                src={userProfiles[userPick.username]}
                alt={`${userPick.username}'s profile`}
                className="profile-picture"
              />
            )}
            <h3>{getDisplayName(userPick.username)}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OtherPicks;
