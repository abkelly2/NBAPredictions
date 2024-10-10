import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import './ViewPicks.css'; // Reuse the same CSS used for MakePicks

function ViewPicks() {
  const { userId } = useParams(); // Get the user ID from the URL
  const [userPicks, setUserPicks] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(''); // For fetching profile picture
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user picks by userId
        const docRef = doc(db, 'userPicks', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userPicksData = docSnap.data();
          setUserPicks(userPicksData);



          // Fetch the profile picture using the username from userPicks
          const username = userPicksData.username;
          console.log(username) // Extract the username
          const profilesQuery = query(collection(db, 'userProfiles'), where('username', '==', username));
          console.log(profilesQuery);
          console.log("hello")
          const profilesSnapshot = await getDocs(profilesQuery);

          if (!profilesSnapshot.empty) {
            const profileDoc = profilesSnapshot.docs[0];
            setProfilePicUrl(profileDoc.data().profilePicUrl);
              // Set profile picture URL
          } else {
            console.log("No user profile document found!");
            console.log(profilesSnapshot);
          }
        } else {
          console.log("No user picks document found!");
        }

        setLoading(false); // Data fetching is complete
      } catch (error) {
        console.error("Error fetching data: ", error);
        setLoading(false); // Stop loading even on error
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>; // Display loading while fetching data
  }

  if (!userPicks) {
    return <div>No picks found for this user.</div>; // Display message if no picks are found
  }

  const getTeamImageFilename = (name) => `/team_images/${name.toLowerCase().replace(/ /g, '-')}.jpg`;
  const getPlayerImageFilename = (name) => `/player_images/${name.toLowerCase().replace(/ /g, '-')}.jpg`;

  // Helper function to remove "@example.com" from the username
  const formatUsername = (username) => {
    return username.replace('@example.com', '');
  };

  const getCoachImageFilename = (name) => {
    return name
      .toLowerCase()
      .replace(/ - /g, '-') // Replace ' - ' with a single hyphen
      .replace(/\s+/g, '-') // Replace spaces with a hyphen
      .replace(/-+$/, ''); // Remove any trailing hyphens
  };


  // Render the selections sections
  const renderSelectionSection = (title, items, category, showRankings = false) => (
    <div className="selection-section">
      <h3>{title}</h3>
      <div className="team-selection">
        {items.map((item, index) => (
          <div key={index} className="team-slot">
            {showRankings && (
              <div className="ranking-number">
                {index + 1}
              </div>
            )}
            {item && (
              <div className="team-info">
                {category === 'coachOfTheYear'
                  ? <img src={`/coach_images/${getCoachImageFilename(item)}.jpg`} alt={item} className="team-image" />
                  : <img src={['eastPlayoffTeams', 'westPlayoffTeams', 'ecfWinner', 'ecfLoser', 'wcfWinner', 'wcfLoser', 'nbaChampion', 'midSeasonCupChampion', 'worstTeam'].includes(category)
                      ? getTeamImageFilename(item)
                      : getPlayerImageFilename(item)}
                    alt={item}
                    className="team-image"
                  />
                }
                <span>{item}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
  

  
  // Render the finals section with winner and loser on the same line
  const renderFinalsSection = (title, winner, loser, winnerCategory, loserCategory) => (
    <div className="selection-section finals-section">
      <h3>{title}</h3>
      <div className="team-selection finals">
        <div className="finals-team">
          <span className="finals-label">Winner</span>
          <div className="team-info">
            {winner && (
              <>
                <img src={getTeamImageFilename(winner)} alt={winner} className="team-image" />
                <span>{winner}</span>
              </>
            )}
          </div>
        </div>
        <div className="vs-label">vs</div>
        <div className="finals-team">
          <span className="finals-label">Loser</span>
          <div className="team-info">
            {loser && (
              <>
                <img src={getTeamImageFilename(loser)} alt={loser} className="team-image" />
                <span>{loser}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="view-picks-container">
      <div className="profile-header">
        {profilePicUrl && (
          <img src={profilePicUrl} alt={`${userPicks.username}'s profile`} className="profile-picture-large" />
        )}
        <h2 className="profile-username">{formatUsername(userPicks.username)}'s Picks</h2>
      </div>

      {renderSelectionSection('East Playoff Teams (1-8)', userPicks.eastPlayoffTeams, 'eastPlayoffTeams', true)}
      {renderSelectionSection('West Playoff Teams (1-8)', userPicks.westPlayoffTeams, 'westPlayoffTeams', true)}

      {/* Render ECF and WCF Finals with Winner vs Loser */}
      {renderFinalsSection('Eastern Conference Final', userPicks.ecfWinner, userPicks.ecfLoser, 'ecfWinner', 'ecfLoser')}
      {renderFinalsSection('Western Conference Final', userPicks.wcfWinner, userPicks.wcfLoser, 'wcfWinner', 'wcfLoser')}

      {/* NBA Champion and Mid-Season Cup Champion */}
      {renderSelectionSection('NBA Champion', [userPicks.nbaChampion], 'nbaChampion')}
      {renderSelectionSection('Mid-Season Cup Champion', [userPicks.midSeasonCupChampion], 'midSeasonCupChampion')}

      {/* Other Picks */}
      {renderSelectionSection('NBA MVP', [userPicks.mvp], 'mvp')}
      {renderSelectionSection('Defensive Player of the Year', [userPicks.dpoy], 'dpoy')}
      {renderSelectionSection('Rookie of the Year', [userPicks.roty], 'roty')}
      {renderSelectionSection('Sixth Man of the Year', [userPicks.sixthMan], 'sixthMan')}
      {renderSelectionSection('Most Improved Player', [userPicks.mip], 'mip')}
      {renderSelectionSection('Coach of the Year', [userPicks.coachOfTheYear], 'coachOfTheYear')}
      {renderSelectionSection('All-NBA First Team', userPicks.allNBAFirstTeam, 'allNBAFirstTeam')}
      {renderSelectionSection('All-NBA Second Team', userPicks.allNBASecondTeam, 'allNBASecondTeam')}
      {renderSelectionSection('All-NBA Third Team', userPicks.allNBAThirdTeam, 'allNBAThirdTeam')}
      {renderSelectionSection('All-Rookie Team', userPicks.allRookieTeam, 'allRookieTeam')}
      {renderSelectionSection('Worst NBA Team', [userPicks.worstTeam], 'worstTeam')}
    </div>
  );
}

export default ViewPicks;
