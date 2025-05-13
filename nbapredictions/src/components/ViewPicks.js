import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import './ViewPicks.css'; // Reuse the same CSS used for MakePicks
import { calculateUserScore, parseActualResults, SCORING_WEIGHTS } from '../scoring';

function ViewPicks() {
  const { userId } = useParams(); // Get the user ID from the URL
  const [userPicks, setUserPicks] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(''); // For fetching profile picture
  const [loading, setLoading] = useState(true); // Track loading state
  const [spunPlayer, setSpunPlayer] = useState(null); // State for the spun player
  const [actualResults, setActualResults] = useState(null);
  const [combinedPicks, setCombinedPicks] = useState(null);

  // Update combinedPicks whenever userPicks or spunPlayer changes
  useEffect(() => {
    if (userPicks) {
      const combined = {
        ...userPicks,
        spunPlayer: spunPlayer
      };
      console.log('Updating combinedPicks:', combined);
      setCombinedPicks(combined);
    }
  }, [userPicks, spunPlayer]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user picks by userId
        const docRef = doc(db, 'userPicks', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userPicksData = docSnap.data();
          console.log('Fetched user picks:', userPicksData);
          setUserPicks(userPicksData);

          // Fetch the profile picture using the username from userPicks
          const username = userPicksData.username;
          console.log('Username for query:', username);
          const profilesQuery = query(collection(db, 'userProfiles'), where('username', '==', username));
          const profilesSnapshot = await getDocs(profilesQuery);

          if (!profilesSnapshot.empty) {
            const profileDoc = profilesSnapshot.docs[0];
            setProfilePicUrl(profileDoc.data().profilePicUrl);

            // Fetch spun player using username
            const spinsQuery = query(collection(db, 'userSpins'), where('username', '==', username));
            console.log('Querying userSpins collection with username:', username);
            const spinsSnapshot = await getDocs(spinsQuery);
            console.log('Spins query result:', spinsSnapshot.docs.map(doc => doc.data()));
            
            if (!spinsSnapshot.empty) {
              const spinDoc = spinsSnapshot.docs[0];
              const spunPlayerData = spinDoc.data();
              console.log('Found spun player data:', spunPlayerData);
              setSpunPlayer(spunPlayerData.spunPlayer);
            } else {
              console.log('No spun player found for username:', username);
              // Let's try to get all userSpins to see what's in there
              const allSpinsQuery = query(collection(db, 'userSpins'));
              const allSpinsSnapshot = await getDocs(allSpinsQuery);
              console.log('All userSpins documents:', allSpinsSnapshot.docs.map(doc => doc.data()));
            }
          } else {
            console.log("No user profile document found!");
          }
        } else {
          console.log("No user picks document found!");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Add this new useEffect to fetch actual results
  useEffect(() => {
    async function fetchActualResults() {
      try {
        const response = await fetch('/actual_results.txt');
        if (!response.ok) {
          throw new Error('Failed to fetch actual results');
        }
        const actualResultsText = await response.text();
        const results = parseActualResults(actualResultsText);
        setActualResults(results);
      } catch (err) {
        console.error('Error fetching actual results:', err);
      }
    }

    fetchActualResults();
  }, []);

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

  // Add the getSelectionStatus function
  const getSelectionStatus = (category, value, index) => {
    if (!actualResults || !userPicks) return '';

    // Map component categories to actual results categories
    const categoryMapping = {
      'sixthMan': 'smoy',
      'coachOfTheYear': 'coty',
      'roty': 'roy'
    };

    // Get the actual category name from the mapping, or use the original if no mapping exists
    const actualCategory = categoryMapping[category] || category;

    // Check if the category has actual results
    const hasActualResults = (category) => {
      const actualCategory = categoryMapping[category] || category;
      return actualResults[actualCategory] && 
             ((Array.isArray(actualResults[actualCategory]) && actualResults[actualCategory].length > 0) ||
              (!Array.isArray(actualResults[actualCategory]) && actualResults[actualCategory] !== ''));
    };

    // If no actual results for this category, return empty string (no color)
    if (!hasActualResults(category)) return '';

    switch (category) {
      case 'eastPlayoffTeams':
      case 'westPlayoffTeams': {
        const actualTeams = category === 'eastPlayoffTeams' ? actualResults.eastPlayoffTeams : actualResults.westPlayoffTeams;
        if (value === actualTeams[index]) return 'correct';
        if (actualTeams.includes(value)) return 'partial';
        return 'incorrect';
      }
      case 'ecfWinner':
      case 'wcfWinner':
      case 'nbaChampion': {
        const actualValue = actualResults[actualCategory];
        if (value === actualValue) return 'correct';
        return 'incorrect';
      }
      case 'midSeasonCupChampion': {
        console.log('Checking mid-season cup champion status:');
        console.log('User pick:', value);
        console.log('Actual results:', actualResults.midSeasonCupChampion);
        
        if (Array.isArray(actualResults.midSeasonCupChampion) && actualResults.midSeasonCupChampion.length >= 2) {
          if (value === actualResults.midSeasonCupChampion[0]) {
            console.log('Returning correct (champion)');
            return 'correct';
          }
          if (value === actualResults.midSeasonCupChampion[1]) {
            console.log('Returning partial (runner-up)');
            return 'partial';
          }
          console.log('Returning incorrect (not in top 2)');
          return 'incorrect';
        }
        console.log('No valid results found');
        return '';
      }
      case 'mvp':
      case 'dpoy':
      case 'roy':
      case 'mip':
      case 'smoy':
      case 'coty':
      case 'sixthMan':
      case 'coachOfTheYear':
      case 'roty':
      case 'worstTeam': {
        const actualValue = actualResults[actualCategory];
        if (Array.isArray(actualValue)) {
          if (actualValue[0] === value) return 'correct';
          if (actualValue.includes(value)) return 'partial';
          return 'incorrect';
        }
        return '';
      }
      default:
        return '';
    }
  };

  // Add the calculateSelectionPoints function
  const calculateSelectionPoints = (category, value, index) => {
    if (!actualResults || !userPicks) return 0;

    // Map component categories to actual results categories
    const categoryMapping = {
      'sixthMan': 'smoy',
      'coachOfTheYear': 'coty',
      'roty': 'roy'
    };

    const actualCategory = categoryMapping[category] || category;
    const actualValue = actualResults[actualCategory];

    if (!actualValue) return 0;

    switch (category) {
      case 'eastPlayoffTeams':
      case 'westPlayoffTeams': {
        const actualTeams = category === 'eastPlayoffTeams' ? actualResults.eastPlayoffTeams : actualResults.westPlayoffTeams;
        if (value === actualTeams[index]) return SCORING_WEIGHTS.eastPlayoffTeam; // Correct team in correct position
        if (actualTeams.includes(value)) return SCORING_WEIGHTS.playoffTeamWrongPosition; // Team made playoffs but wrong position
        return 0;
      }
      case 'ecfWinner':
      case 'wcfWinner': {
        if (value === actualValue) return SCORING_WEIGHTS.eastFinals; // Correct conference finalist
        return 0;
      }
      case 'nbaChampion': {
        if (value === actualValue) return SCORING_WEIGHTS.champion; // Correct champion
        return 0;
      }
      case 'midSeasonCupChampion': {
        if (Array.isArray(actualValue) && actualValue.length >= 2) {
          if (value === actualValue[0]) return SCORING_WEIGHTS.midSeasonCupChampion; // Champion
          if (value === actualValue[1]) return SCORING_WEIGHTS.midSeasonCupRunnerUp; // Runner-up
          return 0;
        }
        return 0;
      }
      case 'mvp':
      case 'dpoy':
      case 'roy':
      case 'mip':
      case 'smoy':
      case 'coty':
      case 'sixthMan':
      case 'coachOfTheYear':
      case 'roty': {
        if (Array.isArray(actualValue)) {
          const position = actualValue.indexOf(value);
          if (position === 0) return SCORING_WEIGHTS.mvp; // Winner
          if (position === 1) return SCORING_WEIGHTS.mvpSecond; // 2nd place
          if (position === 2) return SCORING_WEIGHTS.mvpThird;  // 3rd place
          if (position === 3) return SCORING_WEIGHTS.mvpFourth;  // 4th place
          if (position === 4) return SCORING_WEIGHTS.mvpFifth;  // 5th place
        }
        return 0;
      }
      case 'allNBAFirstTeam':
      case 'allNBASecondTeam':
      case 'allNBAThirdTeam': {
        const actualTeam = category === 'allNBAFirstTeam' ? actualResults.allNbaFirst :
                          category === 'allNBASecondTeam' ? actualResults.allNbaSecond :
                          actualResults.allNbaThird;
        if (Array.isArray(actualTeam) && actualTeam.includes(value)) {
          return category === 'allNBAFirstTeam' ? SCORING_WEIGHTS.allNbaFirst :
                 category === 'allNBASecondTeam' ? SCORING_WEIGHTS.allNbaSecond :
                 SCORING_WEIGHTS.allNbaThird;
        }
        return 0;
      }
      case 'worstTeam': {
        if (Array.isArray(actualValue)) {
          const position = actualValue.indexOf(value);
          if (position === 0) return SCORING_WEIGHTS.worstTeam; // Worst team
          if (position === 1) return SCORING_WEIGHTS.worstTeamSecond; // 2nd worst
          if (position === 2) return SCORING_WEIGHTS.worstTeamThird; // 3rd worst
          if (position === 3) return SCORING_WEIGHTS.worstTeamFourth; // 4th worst
          if (position === 4) return SCORING_WEIGHTS.worstTeamFifth; // 5th worst
        }
        return 0;
      }
      default:
        return 0;
    }
  };

  // Render the selections sections
  const renderSelectionSection = (title, items, category, showRankings = false) => (
    <div className="selection-section">
      <h3>{title}</h3>
      <div className="team-selection">
        {items.map((item, index) => (
          <div
            key={index}
            className={`team-slot ${getSelectionStatus(category, item, index)}`}
          >
            {showRankings && <div className="ranking-number">{index + 1}</div>}
            {item && (
              <div className="team-info">
                <img
                  src={
                    category === 'coachOfTheYear'
                      ? `/coach_images/${getCoachImageFilename(item)}.jpg`
                      : ['eastPlayoffTeams', 'westPlayoffTeams', 'ecfWinner', 'ecfLoser', 'wcfWinner', 'wcfLoser', 'nbaChampion', 'midSeasonCupChampion', 'worstTeam'].includes(
                          category
                        )
                      ? getTeamImageFilename(item)
                      : getPlayerImageFilename(item)
                  }
                  alt={item}
                  className="team-image"
                />
                <span>{item}</span>
                <div className="points-display">
                  {calculateSelectionPoints(category, item, index) > 0 ? `+${calculateSelectionPoints(category, item, index)}` : ''}
                </div>
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
          <span className="finals-label winner-label">Winner</span>
          <div className={`team-slot ${getSelectionStatus(winnerCategory, winner)}`}>
            {winner && (
              <div className="team-info">
                <img src={getTeamImageFilename(winner)} alt={winner} className="team-image" />
                <span>{winner}</span>
                <div className="points-display">
                  {calculateSelectionPoints(winnerCategory, winner) > 0 ? `+${calculateSelectionPoints(winnerCategory, winner)}` : ''}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="vs-label">vs</div>
        <div className="finals-team">
          <span className="finals-label loser-label">Loser</span>
          <div className={`team-slot ${getSelectionStatus(loserCategory, loser)}`}>
            {loser && (
              <div className="team-info">
                <img src={getTeamImageFilename(loser)} alt={loser} className="team-image" />
                <span>{loser}</span>
                <div className="points-display">
                  {calculateSelectionPoints(loserCategory, loser) > 0 ? `+${calculateSelectionPoints(loserCategory, loser)}` : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSpunPlayerSection = () => (
    spunPlayer && (
      <div className="selection-section">
        <h3>Spun Player</h3>
        <div className="team-selection">
          <div className="team-slot">
            <div className="team-info">
              <img
                src={getPlayerImageFilename(spunPlayer)}
                alt={spunPlayer}
                className="team-image"
              />
              <span>{spunPlayer}</span>
              {actualResults && actualResults.playerPPG && actualResults.playerPPG[spunPlayer] && (
                <div className="points-display">
                  +{actualResults.playerPPG[spunPlayer]}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );

  // Add the renderSection function
  const renderSection = (title, items) => (
    <div className="selection-section">
      <h3>{title}</h3>
      <div className="team-selection">
        {items.map((item, index) => (
          <div
            key={index}
            className={`team-slot ${getSelectionStatus(item.label, item.userPick)}`}
          >
            {item.userPick && (
              <div className="team-info">
                <img
                  src={getTeamImageFilename(item.userPick)}
                  alt={item.userPick}
                  className="team-image"
                />
                <span>{item.userPick}</span>
                <div className="points-display">
                  {item.points > 0 ? `+${item.points}` : ''}
                </div>
              </div>
            )}
          </div>
        ))}
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

      {/* Total Points Display */}
      <div className="total-points">
        <span className="points-label">Total Points:</span>
        <span className="points-value">
          {calculateUserScore({
            ...userPicks,
            spunPlayer: spunPlayer
          }, actualResults)}
        </span>
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
      {renderSpunPlayerSection()}
    </div>
  );
}

export default ViewPicks;
