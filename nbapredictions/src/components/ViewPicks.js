// src/components/ViewPicks.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import './ViewPicks.css';

function ViewPicks() {
  const { userId } = useParams(); // Get the user ID from the URL
  const [userPicks, setUserPicks] = useState(null);

  useEffect(() => {
    const fetchUserPicks = async () => {
      const docRef = doc(db, 'userPicks', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserPicks(docSnap.data());
      } else {
        console.log("No such document!");
      }
    };

    fetchUserPicks();
  }, [userId]);

  if (!userPicks) {
    return <div>Loading...</div>;
  }

  // Render user's picks similar to how `MakePicks` renders selections
  return (
    <div className="view-picks-container">
      <h2>{userPicks.username}'s Picks</h2>

      {/* Render each category of picks */}
      <div className="selection-section">
        <h3>East Playoff Teams (1-8)</h3>
        <ul>
          {userPicks.eastPlayoffTeams.map((team, index) => (
            <li key={index}>{index + 1}. {team}</li>
          ))}
        </ul>
      </div>

      <div className="selection-section">
        <h3>West Playoff Teams (1-8)</h3>
        <ul>
          {userPicks.westPlayoffTeams.map((team, index) => (
            <li key={index}>{index + 1}. {team}</li>
          ))}
        </ul>
      </div>

      {/* Repeat similar sections for other picks */}
      <div className="selection-section">
        <h3>Eastern Conference Final Winner</h3>
        <p>{userPicks.ecfWinner}</p>
      </div>

      <div className="selection-section">
        <h3>Western Conference Final Winner</h3>
        <p>{userPicks.wcfWinner}</p>
      </div>

      <div className="selection-section">
        <h3>MVP</h3>
        <p>{userPicks.mvp}</p>
      </div>

      {/* Continue adding sections for all other picks (DPOY, ROTY, etc.) */}
    </div>
  );
}

export default ViewPicks;
