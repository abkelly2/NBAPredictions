import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM for the portal
import { db } from '../firebase';
import { collection, getDocs, addDoc, where, query } from 'firebase/firestore'; // Import addDoc for saving selections
import './MakePicks.css';
import { getAuth } from 'firebase/auth'; // Import Firebase Auth
import { useNavigate } from 'react-router-dom';
import { Wheel } from 'react-custom-roulette';
import Confetti from 'react-confetti';





function MakePicks() {
  const [spunPlayer, setSpunPlayer] = useState(null); // Stores the spun player
  const [hasSpun, setHasSpun] = useState(false); // Tracks if the user has spun the wheel
  const [wheelData, setWheelData] = useState([]); // Data for the wheel
  const [mustSpin, setMustSpin] = useState(false); // Determines if the wheel is spinning
const [prizeNumber, setPrizeNumber] = useState(0); // The index of the chosen player
const [showConfetti, setShowConfetti] = useState(false); // For the confetti effect
const [justSpun, setJustSpun] = useState(false);
const [windowDimensions, setWindowDimensions] = useState({
  width: window.innerWidth,
  height: window.innerHeight,
});


  const navigate = useNavigate();  // Add this inside the MakePicks component
  const auth = getAuth();
  const currentUser = auth.currentUser; // Access the currently logged-in user
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [coaches, setCoaches] = useState([]); // New state for coaches
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState(''); // Use a single identifier for category and index
  const [searchBoxPosition, setSearchBoxPosition] = useState({ top: 0, left: 0 });

  const [eastPlayoffTeams, setEastPlayoffTeams] = useState(new Array(8).fill(null));
  const [westPlayoffTeams, setWestPlayoffTeams] = useState(new Array(8).fill(null));
  const [ecfTeams, setEcfTeams] = useState(new Array(2).fill(null)); // Two ECF teams (Winner and Loser)
  const [wcfTeams, setWcfTeams] = useState(new Array(2).fill(null)); // Two WCF teams (Winner and Loser)
  const [nbaChampion, setNbaChampion] = useState(null); // New state for NBA Champion
  const [midSeasonCupChampion, setMidSeasonCupChampion] = useState(null); // New state for Mid-Season Cup Champion
  const [mvp, setMvp] = useState(null);
  const [dpoy, setDpoy] = useState(null);
  const [roty, setRoty] = useState(null);
  const [sixthMan, setSixthMan] = useState(null);
  const [mip, setMip] = useState(null);
  const [coachOfTheYear, setCoachOfTheYear] = useState(null);
  const [allNBAFirstTeam, setAllNBAFirstTeam] = useState(new Array(5).fill(null));
  const [allNBASecondTeam, setAllNBASecondTeam] = useState(new Array(5).fill(null));
  const [allNBAThirdTeam, setAllNBAThirdTeam] = useState(new Array(5).fill(null));
  const [allRookieTeam, setAllRookieTeam] = useState(new Array(5).fill(null));
  const [worstTeam, setWorstTeam] = useState(null);
  const [ecfWinner, setEcfWinner] = useState(null);
  const [wcfWinner, setWcfWinner] = useState(null);
  const [ecfLoser, setEcfLoser] = useState(null);
  const [wcfLoser, setWcfLoser] = useState(null);

  

  // Fetch teams, players, and coaches from Firestore
  useEffect(() => {
    const fetchData = async () => {
      const teamsCollection = collection(db, 'nbaTeams');
      const playersCollection = collection(db, 'nbaPlayers');
      const coachesCollection = collection(db, 'nbaCoaches'); // Assuming coaches are in Firestore under 'nbaCoaches'

      const teamsSnapshot = await getDocs(teamsCollection);
      const playersSnapshot = await getDocs(playersCollection);
      const coachesSnapshot = await getDocs(coachesCollection);

      const teamsList = teamsSnapshot.docs.map(doc => doc.data().name);
      const playersList = playersSnapshot.docs.map(doc => doc.data().name);
      const coachesList = coachesSnapshot.docs.map(doc => {
        const { name, team } = doc.data();
        return `${name} - ${team}`;
      });

      setTeams(teamsList);
      setPlayers(playersList);
      setCoaches(coachesList);
      console.log('playersList:', playersList);

      const formattedWheelData = playersList.map(player => ({
        option: player
      }));

      setWheelData(formattedWheelData);


      console.log('Formatted Wheel Data:', formattedWheelData);

      


  };
  const checkUserSpin = async () => {
    if (currentUser) {
      const userSpinQuery = query(
        collection(db, 'userSpins'),
        where('username', '==', currentUser.email)
      );
      const querySnapshot = await getDocs(userSpinQuery);
      if (!querySnapshot.empty) {
        setHasSpun(true);
        const spinData = querySnapshot.docs[0].data();
        setSpunPlayer(spinData.spunPlayer);
      }
    } else {
      console.error("No user is currently logged in.");
    }
// Loading is complete
  };

  fetchData();
  checkUserSpin();
}, [currentUser]);



 

  useEffect(() => {
    // Log wheelData once the state has updated
    console.log('Updated Wheel Data after state change:', wheelData);
    if (wheelData.length > 0) {
      console.log('Sample Wheel Data Item:', wheelData[0]); // Log the structure of the first element
  }
  }, [wheelData]);

  useEffect(() => {
    console.log('playersList:', players);
    console.log('wheelData:', wheelData);
  }, [players, wheelData]);

  // Functions to get image filenames
  const getTeamImageFilename = (name) => `/team_images/${name.toLowerCase().replace(/ /g, '-')}.jpg`;
  const getPlayerImageFilename = (name) => {
    const sanitizedName = name
      .toLowerCase()
      .replace(/\./g, '')
      .replace(/\'/g, '') // Remove all periods and apostrophes
      .replace(/,/g, '')
      .replace(/\s+sr$/i, '') // Remove "sr" if it exists
      .replace(/\s+jr$/i, ''); // Remove "jr" if it exists at the end
    return `/player_images/${sanitizedName.replace(/ /g, '-')}.jpg`;
  };

  const handleSpinWheel = () => {
    if (hasSpun) {
      alert('You have already spun the wheel!');
      return;
    }

    

    // Randomly select a prize index (player)
    console.log("You havent spun");
    const newPrizeNumber = Math.floor(Math.random() * players.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true); // Start the wheel spin
    const randomPlayer = players[prizeNumber];
    

   


  };

  // Handle spin completion
  const handleSpinComplete = () => {
    const randomPlayer = players[prizeNumber];
    setSpunPlayer(randomPlayer);
    setHasSpun(true); // Prevent further spins
    setJustSpun(true);
    setShowConfetti(true);
    console.log("Confetti triggered:", showConfetti);
     // Show confetti after spin completes
  
    // Auto-hide confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  
    // Save the spun player to Firestore
    try {
      addDoc(collection(db, 'userSpins'), {
        username: currentUser.email,
        spunPlayer: randomPlayer,
      });
    } catch (error) {
      console.error('Error saving spun player: ', error);
      alert('An error occurred while saving your spun player.');
    }
  };

  


  

  // Open search box for an existing selection or a new one
  const handleAddClick = (index, category, event) => {
    event.stopPropagation(); // Prevent the click from affecting other elements
    const rect = event.target.getBoundingClientRect();
    setSearchBoxPosition({ top: rect.top + window.scrollY, left: rect.left + window.scrollX });
    setSelectedId(`${category}-${index}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  
    // Identify the category that requires team or player selection
    const list = ['eastPlayoffTeams', 'westPlayoffTeams', 'ecfWinner', 'ecfLoser', 'wcfWinner', 'wcfLoser', 'worstTeam', 'nbaChampion', 'midSeasonCupChampion'].includes(selectedId.split('-')[0])
      ? teams // Use teams for all these categories
      : selectedId.split('-')[0] === 'coachOfTheYear'
        ? coaches // Use coaches list if selecting Coach of the Year
        : players; // Use players list for everything else
    
    // Filter the results based on the query input
    setSearchResults(list.filter(item => item.toLowerCase().includes(e.target.value.toLowerCase())));
  };
  
  const handleSelectItem = (item) => {
    const category = selectedId.split('-')[0];
    const index = parseInt(selectedId.split('-')[1], 10);
  
    // Play sound if Memphis Grizzlies are selected
    if (item === 'Memphis Grizzlies') {
      const audio = new Audio('/grizzlies.mp3'); // Ensure this path is correct based on where your audio is stored
      audio.play();
    }

    
    if (item.toLowerCase().includes('lebron')) {
      const lebronAudio = new Audio('/lebron.mp3');
      lebronAudio.play();
    
      // Add the golden tint when the audio starts playing
      document.body.classList.add('golden-tint');
    
      // Stop the audio and remove the golden tint after 7 seconds
      setTimeout(() => {
        lebronAudio.pause();
        lebronAudio.currentTime = 0; // Reset to start of the audio
    
        // Remove the golden tint after the audio has been stopped
        document.body.classList.remove('golden-tint');
      }, 7000); // 7 seconds
    }
    

    if (item.toLowerCase().includes('tatum')) {
      const lebronAudio = new Audio('/tatum.mp3');
      lebronAudio.play();
  
      // Stop audio after 6 seconds
      setTimeout(() => {
        lebronAudio.pause();
        lebronAudio.currentTime = 0; // Reset to start of the audio
      }, 12000); // 6000 milliseconds = 6 seconds
    }

    if (item.toLowerCase().includes('morant')) {
      const lebronAudio = new Audio('/morant.mp3');
      lebronAudio.play();
    }

    if (item.toLowerCase().includes('anthony edwards')) {
      const lebronAudio = new Audio('/ant.mp3');
      lebronAudio.play();
    }
    if (item.toLowerCase().includes('anthony davis')) {
      const lebronAudio = new Audio('/davis.mp3');
      lebronAudio.play();
    }

    if (item.toLowerCase().includes('curry')) {
      const lebronAudio = new Audio('/curry.mp3');
      lebronAudio.play();
    }
  
  
    // Update state based on category
    switch (category) {
      case 'eastPlayoffTeams':
        setEastPlayoffTeams(prev => {
          const updated = [...prev];
          updated[index] = item;
          return updated;
        });
        break;
      case 'westPlayoffTeams':
        setWestPlayoffTeams(prev => {
          const updated = [...prev];
          updated[index] = item;
          return updated;
        });
        break;
      case 'ecfWinner':
        setEcfWinner(item);
        break;
      case 'ecfLoser':
        setEcfLoser(item);
        break;
      case 'wcfWinner':
        setWcfWinner(item);
        break;
      case 'wcfLoser':
        setWcfLoser(item);
        break;
      case 'nbaChampion':
        setNbaChampion(item);
        break;
      case 'midSeasonCupChampion':
        setMidSeasonCupChampion(item);
        break;
      case 'mvp':
        setMvp(item);
        break;
      case 'dpoy':
        setDpoy(item);
        break;
      case 'roty':
        setRoty(item);
        break;
      case 'sixthMan':
        setSixthMan(item);
        break;
      case 'mip':
        setMip(item);
        break;
      case 'coachOfTheYear':
        setCoachOfTheYear(item);
        break;
      case 'allNBAFirstTeam':
        setAllNBAFirstTeam(prev => {
          const updated = [...prev];
          updated[index] = item;
          return updated;
        });
        break;
      case 'allNBASecondTeam':
        setAllNBASecondTeam(prev => {
          const updated = [...prev];
          updated[index] = item;
          return updated;
        });
        break;
      case 'allNBAThirdTeam':
        setAllNBAThirdTeam(prev => {
          const updated = [...prev];
          updated[index] = item;
          return updated;
        });
        break;
      case 'allRookieTeam':
        setAllRookieTeam(prev => {
          const updated = [...prev];
          updated[index] = item;
          return updated;
        });
        break;
      case 'worstTeam':
        setWorstTeam(item);
        break;
      default:
        break;
    }
  
    // Reset search
    setSearchQuery('');
    setSelectedId('');
  };


  const handleConfirm = () => {
    setShowConfetti(false); // Hide the confetti
    setSpunPlayer(null); // Remove the player's image from the screen
  };


  const renderSearchBox = (index, category) => {
    return ReactDOM.createPortal(
      <div
        className="search-box"
        style={{ top: searchBoxPosition.top + 40, left: searchBoxPosition.left }}
        onClick={(e) => e.stopPropagation()} // Prevent click inside the search box from moving it
      >
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          onClick={(e) => e.stopPropagation()} // Prevent click from closing the search box
        />
        <div className="search-results">
          {searchResults.map((result, idx) => {
            const formattedResult = result
              .toLowerCase()
              .replace(/\s+/g, '-') // Replace spaces with hyphens
              .replace(/-{2,}/g, '-') // Replace multiple hyphens with a single hyphen
              .replace(/-$/, ''); // Remove trailing hyphen if present
  
            const imageSrc = ['eastPlayoffTeams', 'westPlayoffTeams', 'ecfWinner', 'ecfLoser', 'wcfWinner', 'wcfLoser', 'worstTeam', 'nbaChampion', 'midSeasonCupChampion'].includes(category)
              ? getTeamImageFilename(result) // Show team images for team categories
              : category === 'coachOfTheYear'
              ? `/coach_images/${formattedResult}.jpg` // Show coach images for coach category
              : getPlayerImageFilename(result); // Show player images for player categories
  
            return (
              <div key={idx} className="search-result-item" onClick={() => handleSelectItem(result)}>
                <img src={imageSrc} alt={result} className="search-team-image" />
                {result}
              </div>
            );
          })}
        </div>
      </div>,
      document.body // Portal renders to the root body
    );
  };
  


  const renderSelectionSection = (title, items, category, showRankings = false) => (
    <div className="selection-section">
      <h3>{title}</h3>
      <div className="team-selection">
        {items.map((item, index) => (
          <div key={index} className="team-slot" onClick={(event) => handleAddClick(index, category, event)}>
            {/* Show ranking number if rankings are enabled */}
            {showRankings && (
              <div className="ranking-number">
                {index + 1}
              </div>
            )}
            {item ? (
              <div className="team-info">
                <img
                  src={
                    ['eastPlayoffTeams', 'westPlayoffTeams', 'ecfWinner', 'ecfLoser', 'wcfWinner', 'wcfLoser', 'worstTeam', 'nbaChampion', 'midSeasonCupChampion'].includes(category)
                      ? getTeamImageFilename(item) // Use team images for team categories
                      : category === 'coachOfTheYear'
                      ? `/coach_images/${item.toLowerCase().replace(/ - /g, '-').replace(/ /g, '-').replace(/-+$/, '')}.jpg` // Replace spaces with hyphens and trim extra hyphens
                      : getPlayerImageFilename(item) // Use player images for player categories
                  }
                  alt={item}
                  className="team-image"
                />
                <span>{item}</span>
              </div>
            ) : (
              <button onClick={(event) => handleAddClick(index, category, event)}>+</button>
            )}
            {selectedId === `${category}-${index}` && renderSearchBox(index, category)}
          </div>
        ))}
      </div>
    </div>
  );
  
  



  const renderFinalsSection = (title, winner, loser, winnerCategory, loserCategory) => (
    <div className="selection-section finals-section">
      <h3>{title}</h3>
      <div className="team-selection finals">
        <div className="finals-team">
          <span className="finals-label winner-label">Winner</span> {/* Style properly */}
          {renderSelectionSection('', [winner], winnerCategory)}
        </div>
        <div className="vs-label">vs</div>
        <div className="finals-team">
          <span className="finals-label loser-label">Loser</span> {/* Style properly */}
          {renderSelectionSection('', [loser], loserCategory)}
        </div>
      </div>
    </div>
  );
  
  
  // Check if all selections are made
  const areAllSelectionsMade = () => {
    return (
      !eastPlayoffTeams.includes(null) &&
      !westPlayoffTeams.includes(null) &&
      ecfWinner && ecfLoser &&
      wcfLoser && wcfWinner &&
      nbaChampion &&
      midSeasonCupChampion &&
      mvp &&
      dpoy &&
      roty &&
      sixthMan &&
      mip &&
      coachOfTheYear &&
      !allNBAFirstTeam.includes(null) &&
      !allNBASecondTeam.includes(null) &&
      !allNBAThirdTeam.includes(null) &&
      !allRookieTeam.includes(null) &&
      worstTeam
    );
  };

  // Handle lock selections button click
  const handleLockSelections = async () => {
    if (!areAllSelectionsMade()) {
      alert('Please make all selections before locking them.');
      return;
    }

    try {
      // Save the picks to the Firestore database
      await addDoc(collection(db, 'userPicks'), {
        username: currentUser.email,
        eastPlayoffTeams,
        westPlayoffTeams,
        ecfWinner,
        ecfLoser, // Store the ECF Loser
        wcfWinner,
        wcfLoser,
        nbaChampion,  // Include NBA Champion
        midSeasonCupChampion, // Store the WCF Loser
        mvp,
        dpoy,
        roty,
        sixthMan,
        mip,
        coachOfTheYear,
        allNBAFirstTeam,
        allNBASecondTeam,
        allNBAThirdTeam,
        allRookieTeam,
        worstTeam,
    });
    

      alert('Your selections have been locked successfully!');
      navigate('/');  // This will take you back to the home page
    } catch (error) {
      console.error('Error saving selections: ', error);
      alert('An error occurred while saving your selections. Please try again.');
    }
  };

  return (
    <div className="make-picks-container">
      <h2>Make Your Picks</h2>

      {/* East and West Playoff Teams Sections with Rankings */}
      {renderSelectionSection('East Playoff Teams (1-8)', eastPlayoffTeams, 'eastPlayoffTeams', true)}
      {renderSelectionSection('West Playoff Teams (1-8)', westPlayoffTeams, 'westPlayoffTeams', true)}

      {/* ECF and WCF Selection Sections */}
      {renderFinalsSection('Eastern Conference Final', ecfWinner, ecfLoser, 'ecfWinner', 'ecfLoser')}
      {renderFinalsSection('Western Conference Final', wcfWinner, wcfLoser, 'wcfWinner', 'wcfLoser')}



      {/* NBA Champion and Mid-Season Cup Champion */}
      {renderSelectionSection('NBA Champion', [nbaChampion], 'nbaChampion')}
      {renderSelectionSection('Mid-Season Cup Champion', [midSeasonCupChampion], 'midSeasonCupChampion')}

      {/* Other Sections without Rankings */}
      {renderSelectionSection('NBA MVP', [mvp], 'mvp')}
      {renderSelectionSection('Defensive Player of the Year', [dpoy], 'dpoy')}
      {renderSelectionSection('Rookie of the Year', [roty], 'roty')}
      {renderSelectionSection('Sixth Man of the Year', [sixthMan], 'sixthMan')}
      {renderSelectionSection('Most Improved Player', [mip], 'mip')}
      {renderSelectionSection('Coach of the Year', [coachOfTheYear], 'coachOfTheYear')}
      {renderSelectionSection('All-NBA First Team', allNBAFirstTeam, 'allNBAFirstTeam')}
      {renderSelectionSection('All-NBA Second Team', allNBASecondTeam, 'allNBASecondTeam')}
      {renderSelectionSection('All-NBA Third Team', allNBAThirdTeam, 'allNBAThirdTeam')}
      {renderSelectionSection('All-Rookie Team', allRookieTeam, 'allRookieTeam')}
      {renderSelectionSection('Worst NBA Team', [worstTeam], 'worstTeam')}



      

      <div className="spin-the-wheel-container">
        {spunPlayer ? (
          <div className="selection-section">
            {/* If the player has already spun, show the spun player in a box */}
            <h3>Your Spun Player</h3>
            <div className="team-selection">
            <div className="team-slot"style={{ width: '100%' }}>
              <div className="team-info">
              <img
                src={`/player_images/${spunPlayer.toLowerCase().replace(/ /g, '-')}.jpg`}
                alt={spunPlayer}
                className="player-image"
              />
              <span>{spunPlayer}</span>
            </div>
            </div>
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {wheelData && wheelData.length > 0 ? (
              <>
                <Wheel
                  mustStartSpinning={mustSpin}
                  prizeNumber={prizeNumber}
                  data={wheelData}
                  onStopSpinning={() => {
                    setMustSpin(false);
                    handleSpinComplete();
                  }}
                />
                {!hasSpun && (
                  <button className="spin-the-wheel-button" onClick={handleSpinWheel}>
                    Spin the Wheel!
                  </button>
                )}
              </>
            ) : (
              <p>Loading wheel data...</p>
            )}
          </div>
        )}
      </div>

      {/* Confetti effect */}
      {showConfetti && (
        <div
          style={{
            position: 'absolute',
            top: window.scrollY,
            left: 0,
            width: windowDimensions.width,
            height: windowDimensions.height,
            zIndex: 9999,
          }}
        >
          <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
            numberOfPieces={500}
            recycle={false}
          />
        </div>
      )}

      
      
      


            
 



      {/* Lock Selections Button */}
      <button className="lock-selections-button" onClick={handleLockSelections}>
        Lock Selections
      </button>
    </div>
  );
}

export default MakePicks;
