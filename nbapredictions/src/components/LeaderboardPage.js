import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { calculateUserScore, parseActualResults } from '../scoring';
import { Link } from 'react-router-dom';
import './LeaderboardPage.css';

function LeaderboardPage() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchScores() {
      try {
        // Fetch actual results from the text file
        const response = await fetch('/actual_results.txt');
        if (!response.ok) {
          throw new Error('Failed to fetch actual results');
        }
        const actualResultsText = await response.text();
        const actualResults = parseActualResults(actualResultsText);

        // Fetch all user picks from Firestore
        const userPicksRef = collection(db, 'userPicks');
        const userPicksSnapshot = await getDocs(userPicksRef);
        
        const userScores = [];
        
        // Process each user's picks
        for (const doc of userPicksSnapshot.docs) {
          const userPicks = doc.data();
          
          // Fetch spun player for this user
          const spinsQuery = query(collection(db, 'userSpins'), where('username', '==', userPicks.username));
          const spinsSnapshot = await getDocs(spinsQuery);
          let spunPlayer = null;
          
          if (!spinsSnapshot.empty) {
            spunPlayer = spinsSnapshot.docs[0].data().spunPlayer;
          }
          
          // Calculate score with spun player included
          const score = calculateUserScore({
            ...userPicks,
            spunPlayer: spunPlayer
          }, actualResults);
          
          // Fetch profile picture
          const profilesQuery = query(collection(db, 'userProfiles'), where('username', '==', userPicks.username));
          const profilesSnapshot = await getDocs(profilesQuery);
          let profilePicUrl = '';
          
          if (!profilesSnapshot.empty) {
            profilePicUrl = profilesSnapshot.docs[0].data().profilePicUrl;
          }

          userScores.push({
            username: userPicks.username,
            score: score,
            profilePicUrl: profilePicUrl,
            userId: doc.id
          });
        }

        // Sort scores in descending order
        userScores.sort((a, b) => b.score - a.score);
        setScores(userScores);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchScores();
  }, []);

  // Helper function to remove "@example.com" from the username
  const formatUsername = (username) => {
    return username.replace('@example.com', '');
  };

  if (loading) {
    return <div className="leaderboard-container">Loading scores...</div>;
  }

  if (error) {
    return <div className="leaderboard-container">Error: {error}</div>;
  }

  return (
    <div className="leaderboard-container">
      <h1>NBA Predictions Leaderboard</h1>
      <div className="leaderboard">
        {scores.map((user, index) => (
          <div key={user.username} className={`leaderboard-entry ${index < 3 ? `top-${index + 1}` : ''}`}>
            <div className="rank">#{index + 1}</div>
            <div className="user-info">
              {user.profilePicUrl ? (
                <img src={user.profilePicUrl} alt={`${user.username}'s profile`} className="profile-picture" />
              ) : (
                <div className="profile-picture-placeholder">
                  {formatUsername(user.username).charAt(0).toUpperCase()}
                </div>
              )}
              <Link to={`/picks/${user.userId}`} className="username">
                {formatUsername(user.username)}
              </Link>
            </div>
            <div className="score">{user.score} points</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LeaderboardPage; 