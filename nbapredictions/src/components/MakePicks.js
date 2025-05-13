// src/components/MakePicks.js

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { db } from '../firebase';
import { collection, getDocs, addDoc, where, query, updateDoc, doc } from 'firebase/firestore';
import './MakePicks.css';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Wheel } from 'react-custom-roulette';
import Confetti from 'react-confetti';

function MakePicks() {
  const [spunPlayer, setSpunPlayer] = useState(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [wheelData, setWheelData] = useState([]);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [searchBoxPosition, setSearchBoxPosition] = useState({ top: 0, left: 0 });

  const [eastPlayoffTeams, setEastPlayoffTeams] = useState(new Array(8).fill(null));
  const [westPlayoffTeams, setWestPlayoffTeams] = useState(new Array(8).fill(null));
  const [ecfWinner, setEcfWinner] = useState(null);
  const [ecfLoser, setEcfLoser] = useState(null);
  const [wcfWinner, setWcfWinner] = useState(null);
  const [wcfLoser, setWcfLoser] = useState(null);
  const [nbaChampion, setNbaChampion] = useState(null);
  const [midSeasonCupChampion, setMidSeasonCupChampion] = useState(null);
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

  const [picksDocId, setPicksDocId] = useState(null);
  const [isPicksLoaded, setIsPicksLoaded] = useState(false);

  // New state variables for animation
  const [showSpunPlayerAnimation, setShowSpunPlayerAnimation] = useState(false);
  const [isImageZoomedIn, setIsImageZoomedIn] = useState(false);

  // Fetch teams, players, and coaches from Firestore
  useEffect(() => {
    const fetchData = async () => {
      const teamsCollection = collection(db, 'nbaTeams');
      const playersCollection = collection(db, 'nbaPlayers');
      const coachesCollection = collection(db, 'nbaCoaches');

      const teamsSnapshot = await getDocs(teamsCollection);
      const playersSnapshot = await getDocs(playersCollection);
      const coachesSnapshot = await getDocs(coachesCollection);

      const teamsList = teamsSnapshot.docs.map((doc) => doc.data().name);
      const playersList = playersSnapshot.docs.map((doc) => doc.data().name);
      const coachesList = coachesSnapshot.docs.map((doc) => {
        const { name, team } = doc.data();
        return `${name} - ${team}`;
      });

      setTeams(teamsList);
      setPlayers(playersList);
      setCoaches(coachesList);

      const formattedWheelData = playersList.map((player) => ({
        option: player,
      }));

      setWheelData(formattedWheelData);
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
        console.error('No user is currently logged in.');
      }
    };

    fetchData();
    checkUserSpin();

    // Update window dimensions on resize
    const handleResize = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [currentUser]);

  // Fetch user's existing picks when the component loads
  useEffect(() => {
    const fetchUserPicks = async () => {
      if (currentUser) {
        const userPicksQuery = query(
          collection(db, 'userPicks'),
          where('username', '==', currentUser.email)
        );
        const querySnapshot = await getDocs(userPicksQuery);
        if (!querySnapshot.empty) {
          const picksData = querySnapshot.docs[0].data();

          // Update component state with picksData
          setEastPlayoffTeams(picksData.eastPlayoffTeams || new Array(8).fill(null));
          setWestPlayoffTeams(picksData.westPlayoffTeams || new Array(8).fill(null));
          setEcfWinner(picksData.ecfWinner || null);
          setEcfLoser(picksData.ecfLoser || null);
          setWcfWinner(picksData.wcfWinner || null);
          setWcfLoser(picksData.wcfLoser || null);
          setNbaChampion(picksData.nbaChampion || null);
          setMidSeasonCupChampion(picksData.midSeasonCupChampion || null);
          setMvp(picksData.mvp || null);
          setDpoy(picksData.dpoy || null);
          setRoty(picksData.roty || null);
          setSixthMan(picksData.sixthMan || null);
          setMip(picksData.mip || null);
          setCoachOfTheYear(picksData.coachOfTheYear || null);
          setAllNBAFirstTeam(picksData.allNBAFirstTeam || new Array(5).fill(null));
          setAllNBASecondTeam(picksData.allNBASecondTeam || new Array(5).fill(null));
          setAllNBAThirdTeam(picksData.allNBAThirdTeam || new Array(5).fill(null));
          setAllRookieTeam(picksData.allRookieTeam || new Array(5).fill(null));
          setWorstTeam(picksData.worstTeam || null);

          // Store the document ID to update the picks later
          const docId = querySnapshot.docs[0].id;
          setPicksDocId(docId);
        }
        // Set picks as loaded
        setIsPicksLoaded(true);
      }
    };

    fetchUserPicks();
  }, [currentUser]);

  // Functions to get image filenames
  const getTeamImageFilename = (name) =>
    `/team_images/${name.toLowerCase().replace(/ /g, '-')}.jpg`;
  const getPlayerImageFilename = (name) => {
    const sanitizedName = name
      .toLowerCase()
      .replace(/\./g, '')
      .replace(/'/g, '')
      .replace(/,/g, '')
      .replace(/\s+sr$/i, '')
      .replace(/\s+jr$/i, '');
    return `/player_images/${sanitizedName.replace(/ /g, '-')}.jpg`;
  };

  const handleSpinWheel = () => {
    if (hasSpun) {
      alert('You have already spun the wheel!');
      return;
    }

    const newPrizeNumber = Math.floor(Math.random() * players.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
  };

  // Handle spin completion
  const handleSpinComplete = () => {
    const randomPlayer = players[prizeNumber];
    setSpunPlayer(randomPlayer);
    setHasSpun(true);
    setShowSpunPlayerAnimation(true); // Show the animation overlay

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

  // Handle confirm button click
  const handleConfirm = () => {
    setShowSpunPlayerAnimation(false);
    setShowConfetti(false);
    setIsImageZoomedIn(false);
  };

  // Open search box for an existing selection or a new one
  const handleAddClick = (index, category, event) => {
    event.stopPropagation();
    const rect = event.target.getBoundingClientRect();
    setSearchBoxPosition({ top: rect.top + window.scrollY, left: rect.left + window.scrollX });
    setSelectedId(`${category}-${index}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);

    // Identify the category that requires team or player selection
    const list = ['eastPlayoffTeams', 'westPlayoffTeams', 'ecfWinner', 'ecfLoser', 'wcfWinner', 'wcfLoser', 'worstTeam', 'nbaChampion', 'midSeasonCupChampion'].includes(
      selectedId.split('-')[0]
    )
      ? teams
      : selectedId.split('-')[0] === 'coachOfTheYear'
      ? coaches
      : players;

    setSearchResults(
      list.filter((item) => item.toLowerCase().includes(e.target.value.toLowerCase()))
    );
  };

  // Function to check if any picks have been made
  const havePicks = () => {
    return (
      eastPlayoffTeams.some((team) => team !== null) ||
      westPlayoffTeams.some((team) => team !== null) ||
      ecfWinner !== null ||
      ecfLoser !== null ||
      wcfWinner !== null ||
      wcfLoser !== null ||
      nbaChampion !== null ||
      midSeasonCupChampion !== null ||
      mvp !== null ||
      dpoy !== null ||
      roty !== null ||
      sixthMan !== null ||
      mip !== null ||
      coachOfTheYear !== null ||
      allNBAFirstTeam.some((player) => player !== null) ||
      allNBASecondTeam.some((player) => player !== null) ||
      allNBAThirdTeam.some((player) => player !== null) ||
      allRookieTeam.some((player) => player !== null) ||
      worstTeam !== null
    );
  };

  // Function to save picks to Firestore
  const savePicks = async () => {
    if (currentUser && isPicksLoaded && havePicks()) {
      try {
        if (picksDocId) {
          const picksRef = doc(db, 'userPicks', picksDocId);
          await updateDoc(picksRef, {
            eastPlayoffTeams,
            westPlayoffTeams,
            ecfWinner,
            ecfLoser,
            wcfWinner,
            wcfLoser,
            nbaChampion,
            midSeasonCupChampion,
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
        } else {
          const docRef = await addDoc(collection(db, 'userPicks'), {
            username: currentUser.email,
            eastPlayoffTeams,
            westPlayoffTeams,
            ecfWinner,
            ecfLoser,
            wcfWinner,
            wcfLoser,
            nbaChampion,
            midSeasonCupChampion,
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
          setPicksDocId(docRef.id);
        }
      } catch (error) {
        console.error('Error saving picks: ', error);
        alert('An error occurred while saving your selections. Please try again.');
      }
    }
  };

  // Save picks whenever any of the picks state variables change
  useEffect(() => {
    if (isPicksLoaded) {
      savePicks();
    }
  }, [
    eastPlayoffTeams,
    westPlayoffTeams,
    ecfWinner,
    ecfLoser,
    wcfWinner,
    wcfLoser,
    nbaChampion,
    midSeasonCupChampion,
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
    picksDocId,
    currentUser,
    isPicksLoaded,
  ]);

  const handleSelectItem = (item) => {
    const category = selectedId.split('-')[0];
    const index = parseInt(selectedId.split('-')[1], 10);

    // Play sound if Memphis Grizzlies are selected
    if (item === 'Memphis Grizzlies') {
      const audio = new Audio('/grizzlies.mp3');
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
        lebronAudio.currentTime = 0;
        document.body.classList.remove('golden-tint');
      }, 7000);
    }

    if (item.toLowerCase().includes('tatum')) {
      const tatumAudio = new Audio('/tatum.mp3');
      tatumAudio.play();

      // Stop audio after 12 seconds
      setTimeout(() => {
        tatumAudio.pause();
        tatumAudio.currentTime = 0;
      }, 12000);
    }

    if (item.toLowerCase().includes('morant')) {
      const morantAudio = new Audio('/morant.mp3');
      morantAudio.play();
    }

    if (item.toLowerCase().includes('anthony edwards')) {
      const antAudio = new Audio('/ant.mp3');
      antAudio.play();
    }

    if (item.toLowerCase().includes('anthony davis')) {
      const davisAudio = new Audio('/davis.mp3');
      davisAudio.play();
    }

    if (item.toLowerCase().includes('curry')) {
      const curryAudio = new Audio('/curry.mp3');
      curryAudio.play();
    }

    // Update state based on category
    switch (category) {
      case 'eastPlayoffTeams':
        setEastPlayoffTeams((prev) => {
          const updated = [...prev];
          updated[index] = item;
          return updated;
        });
        break;
      case 'westPlayoffTeams':
        setWestPlayoffTeams((prev) => {
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
        setAllNBAFirstTeam((prev) => {
          const updated = [...prev];
          updated[index] = item;
          return updated;
        });
        break;
      case 'allNBASecondTeam':
        setAllNBASecondTeam((prev) => {
          const updated = [...prev];
          updated[index] = item;
          return updated;
        });
        break;
      case 'allNBAThirdTeam':
        setAllNBAThirdTeam((prev) => {
          const updated = [...prev];
          updated[index] = item;
          return updated;
        });
        break;
      case 'allRookieTeam':
        setAllRookieTeam((prev) => {
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

  const renderSearchBox = (index, category) => {
    return ReactDOM.createPortal(
      <div
        className="search-box"
        style={{ top: searchBoxPosition.top + 40, left: searchBoxPosition.left }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="search-results">
          {searchResults.map((result, idx) => {
            const formattedResult = result
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/-{2,}/g, '-')
              .replace(/-$/, '');

            const imageSrc = ['eastPlayoffTeams', 'westPlayoffTeams', 'ecfWinner', 'ecfLoser', 'wcfWinner', 'wcfLoser', 'worstTeam', 'nbaChampion', 'midSeasonCupChampion'].includes(
              category
            )
              ? getTeamImageFilename(result)
              : category === 'coachOfTheYear'
              ? `/coach_images/${formattedResult}.jpg`
              : getPlayerImageFilename(result);

            return (
              <div key={idx} className="search-result-item" onClick={() => handleSelectItem(result)}>
                <img src={imageSrc} alt={result} className="search-team-image" />
                {result}
              </div>
            );
          })}
        </div>
      </div>,
      document.body
    );
  };

  const renderSelectionSection = (title, items, category, showRankings = false) => (
    <div className="selection-section">
      <h3>{title}</h3>
      <div className="team-selection">
        {items.map((item, index) => (
          <div
            key={index}
            className="team-slot"
            onClick={(event) => handleAddClick(index, category, event)}
          >
            {showRankings && <div className="ranking-number">{index + 1}</div>}
            {item ? (
              <div className="team-info">
                <img
                  src={
                    ['eastPlayoffTeams', 'westPlayoffTeams', 'ecfWinner', 'ecfLoser', 'wcfWinner', 'wcfLoser', 'worstTeam', 'nbaChampion', 'midSeasonCupChampion'].includes(
                      category
                    )
                      ? getTeamImageFilename(item)
                      : category === 'coachOfTheYear'
                      ? `/coach_images/${item
                          .toLowerCase()
                          .replace(/ - /g, '-')
                          .replace(/ /g, '-')
                          .replace(/-+$/, '')}.jpg`
                      : getPlayerImageFilename(item)
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
          <span className="finals-label winner-label">Winner</span>
          {renderSelectionSection('', [winner], winnerCategory)}
        </div>
        <div className="vs-label">vs</div>
        <div className="finals-team">
          <span className="finals-label loser-label">Loser</span>
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
      ecfWinner &&
      ecfLoser &&
      wcfLoser &&
      wcfWinner &&
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
        ecfLoser,
        wcfWinner,
        wcfLoser,
        nbaChampion,
        midSeasonCupChampion,
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
      navigate('/');
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
              <div className="team-slot" style={{ width: '100%' }}>
                <div className="team-info">
                  <img
                    src={getPlayerImageFilename(spunPlayer)}
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

      {/* Animation Overlay */}
      {showSpunPlayerAnimation && (
        <div className="player-animation-overlay">
          <div className="player-image-container">
            <h2 className="spun-player-name">{spunPlayer}</h2>
            <img
              src={getPlayerImageFilename(spunPlayer)}
              alt={spunPlayer}
              className={`animated-player-image ${isImageZoomedIn ? 'hover' : ''}`}
              onAnimationEnd={() => {
                setIsImageZoomedIn(true);
                setShowConfetti(true);
              }}
            />
            <button className="confirm-button" onClick={handleConfirm}>
              Confirm
            </button>
          </div>
          {/* Confetti effect */}
          {showConfetti && (
            <Confetti
              width={windowDimensions.width}
              height={windowDimensions.height}
              numberOfPieces={500}
              recycle={false}
            />
          )}
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
