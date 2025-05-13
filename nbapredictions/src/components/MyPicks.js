// src/components/MyPicks.js

import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  addDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Link } from 'react-router-dom';
import './MakePicks.css'; // Assuming you use the same CSS file
import ReactDOM from 'react-dom';
import { getAuth } from 'firebase/auth';
import { Wheel } from 'react-custom-roulette';
import Confetti from 'react-confetti';

function MyPicks() {
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [selections, setSelections] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [searchBoxPosition, setSearchBoxPosition] = useState({ top: 0, left: 0 });
  const [teams, setTeams] = useState([]);
  const [spunPlayer, setSpunPlayer] = useState(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [wheelData, setWheelData] = useState([]);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [players, setPlayers] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [picksDocId, setPicksDocId] = useState(null);
  const [isPicksLoaded, setIsPicksLoaded] = useState(false);

  // New state variables for animation
  const [showSpunPlayerAnimation, setShowSpunPlayerAnimation] = useState(false);
  const [isImageZoomedIn, setIsImageZoomedIn] = useState(false);

  const usernameToEmail = (username) => `${username}@example.com`;
  const getPlayerImageFilename = (name) => {
    const sanitizedName = name
      .toLowerCase()
      .replace(/\./g, '')
      .replace(/'/g, '')
      .replace(/,/g, '')
      .replace(/\s+sr$/i, '')
      .replace(/\s+jr$/i, '')
      .replace(/[\s-]+/g, '-');
    return `/player_images/${sanitizedName}.jpg`;
  };
  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Handle profile picture change
  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('User is not authenticated.');
        }

        const profilePicRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(profilePicRef, file);
        const newProfilePicUrl = await getDownloadURL(profilePicRef);

        const timestampedProfilePicUrl = `${newProfilePicUrl}?t=${new Date().getTime()}`;

        const userProfileDocRef = doc(db, 'userProfiles', user.uid);
        const docSnap = await getDoc(userProfileDocRef);

        if (docSnap.exists()) {
          await updateDoc(userProfileDocRef, { profilePicUrl: timestampedProfilePicUrl });
        } else {
          await setDoc(userProfileDocRef, {
            username: user.email,
            profilePicUrl: timestampedProfilePicUrl,
          });
        }

        setProfilePicUrl(timestampedProfilePicUrl);

        alert('Profile picture updated successfully!');
      } catch (error) {
        console.error('Error updating profile picture:', error);
        alert('Failed to update profile picture. Please try again.');
      }
    }
  };

  // Upload profile picture after user signs up
  const uploadProfilePicAfterSignUp = async (user) => {
    if (profilePic) {
      try {
        const profilePicRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(profilePicRef, profilePic);
        const profilePicUrl = await getDownloadURL(profilePicRef);

        await updateDoc(doc(db, 'userProfiles', user.uid), {
          profilePicUrl,
        });

        setProfilePicUrl(profilePicUrl);
      } catch (error) {
        console.error('Error uploading profile picture after sign up:', error);
      }
    }
  };

  // Handle sign-up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (signUpPassword.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        usernameToEmail(signUpUsername),
        signUpPassword
      );
      const user = userCredential.user;

      await setDoc(doc(db, 'userProfiles', user.uid), {
        username: `${signUpUsername.toLowerCase()}@example.com`,
        profilePicUrl: '',
      });

      await uploadProfilePicAfterSignUp(user);

      setUser(user);
      alert('Account created successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await setPersistence(auth, browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        usernameToEmail(loginUsername),
        loginPassword
      );
      setUser(userCredential.user);
      alert('Logged in successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user's picks from Firestore
  useEffect(() => {
    if (user) {
      const fetchPicks = async () => {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          const profilesQuery = query(
            collection(db, 'userProfiles'),
            where('username', '==', user.email)
          );
          const profilesSnapshot = await getDocs(profilesQuery);

          if (!profilesSnapshot.empty) {
            const profileDoc = profilesSnapshot.docs[0];
            setProfilePicUrl(profileDoc.data().profilePicUrl);
          }
        }

        const username = user.email;
        const picksQuery = query(collection(db, 'userPicks'), where('username', '==', username));
        const querySnapshot = await getDocs(picksQuery);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          setSelections(docSnap.data());

          setPicksDocId(docSnap.id);

          setIsPicksLoaded(true);

          const spinsQuery = query(collection(db, 'userSpins'), where('username', '==', username));
          const spinsSnapshot = await getDocs(spinsQuery);
          if (!spinsSnapshot.empty) {
            const spinDoc = spinsSnapshot.docs[0];
            setSpunPlayer(spinDoc.data().spunPlayer);
          }
        } else {
          setSelections(null);
          setIsPicksLoaded(true);
        }
      };

      fetchPicks();
    }
  }, [user]);

  // Fetch teams, players, and coaches
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !currentUser.email) {
        console.error('User is not logged in.');
        return;
      }

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

      // Update window dimensions on resize
      const handleResize = () => {
        setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    };

    fetchData();
  }, [currentUser]);

  const handleSpinWheel = () => {
    if (hasSpun) {
      alert('You have already spun the wheel!');
      return;
    }

    const newPrizeNumber = Math.floor(Math.random() * wheelData.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
  };

  const handleSpinComplete = () => {
    const randomPlayer = wheelData[prizeNumber].option;
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

  // Close search box on "Escape" key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedId('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Search and edit functionality
  const handleAddClick = (index, category, event) => {
    event.stopPropagation();
    const rect = event.target.getBoundingClientRect();
    setSearchBoxPosition({ top: rect.top + window.scrollY, left: rect.left + window.scrollX });
    setSelectedId(`${category}-${index}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    const list = ['eastPlayoffTeams', 'westPlayoffTeams', 'ecfWinner', 'ecfLoser', 'wcfWinner', 'wcfLoser', 'nbaChampion', 'midSeasonCupChampion', 'worstTeam'].includes(
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

  const handleSelectItem = (item) => {
    const category = selectedId.split('-')[0];
    const index = parseInt(selectedId.split('-')[1], 10);

    // Play sounds based on selection
    if (item === 'Memphis Grizzlies') {
      const audio = new Audio('/grizzlies.mp3');
      audio.play();
    }

    if (item.toLowerCase().includes('lebron')) {
      const lebronAudio = new Audio('/lebron.mp3');
      lebronAudio.play();

      document.body.classList.add('golden-tint');

      setTimeout(() => {
        lebronAudio.pause();
        lebronAudio.currentTime = 0;
        document.body.classList.remove('golden-tint');
      }, 7000);
    }

    if (item.toLowerCase().includes('tatum')) {
      const tatumAudio = new Audio('/tatum.mp3');
      tatumAudio.play();

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

    // Update selections based on category
    setSelections((prev) => {
      const updated = { ...prev };
      if (Array.isArray(updated[category])) {
        updated[category][index] = item;
      } else {
        updated[category] = item;
      }
      return updated;
    });

    // Reset search
    setSearchQuery('');
    setSelectedId('');
  };

  const formatCoachImageFilename = (coachNameAndTeam) => {
    return coachNameAndTeam
      .toLowerCase()
      .replace(/ - /g, '-')
      .replace(/ /g, '-')
      .replace(/-+$/, '');
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
            const formattedCoachName = formatCoachImageFilename(result);
            const imageSrc =
              category === 'coachOfTheYear'
                ? `/coach_images/${formattedCoachName}.jpg`
                : ['eastPlayoffTeams', 'westPlayoffTeams', 'ecfWinner', 'ecfLoser', 'wcfWinner', 'wcfLoser', 'nbaChampion', 'midSeasonCupChampion', 'worstTeam'].includes(
                    category
                  )
                ? `/team_images/${result.toLowerCase().replace(/ /g, '-')}.jpg`
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
                    category === 'coachOfTheYear'
                      ? `/coach_images/${formatCoachImageFilename(item)}.jpg`
                      : ['eastPlayoffTeams', 'westPlayoffTeams', 'ecfWinner', 'ecfLoser', 'wcfWinner', 'wcfLoser', 'nbaChampion', 'midSeasonCupChampion', 'worstTeam'].includes(
                          category
                        )
                      ? `/team_images/${item.toLowerCase().replace(/ /g, '-')}.jpg`
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

  // Function to save selections to Firestore
  const saveSelections = async () => {
    if (!currentUser || !currentUser.email) {
      console.error('User is not logged in or email is missing.');
      return;
    }

    if (user && selections && picksDocId) {
      try {
        const docRef = doc(db, 'userPicks', picksDocId);
        await updateDoc(docRef, selections);
        console.log('Selections saved successfully!');
      } catch (error) {
        console.error('Error saving selections:', error);
      }
    }
  };

  // Save selections whenever they change
  useEffect(() => {
    if (isPicksLoaded) {
      saveSelections();
    }
  }, [selections, isPicksLoaded]);

  return (
    <div className="my-picks-box">
      {!user && (
        <div className="auth-forms">
          <div className="auth-section">
            <h3>Sign Up</h3>
            <form onSubmit={handleSignUp} className="auth-form">
              <input
                type="text"
                placeholder="Username"
                value={signUpUsername}
                onChange={(e) => setSignUpUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                required
              />
              <button type="submit" className="auth-button">
                Sign Up
              </button>
            </form>
          </div>

          <div className="auth-section">
            <h3>Login</h3>
            <form onSubmit={handleLogin} className="auth-form">
              <input
                type="text"
                placeholder="Username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <button type="submit" className="auth-button">
                Login
              </button>
            </form>
          </div>
        </div>
      )}

      {user && selections && (
        <div className="make-picks-container">
          {user && (
            <div className="profile-header">
              {/* Profile Picture */}
              {profilePicUrl ? (
                <img
                  src={profilePicUrl}
                  alt="Profile"
                  className="profile-picture-large"
                  onClick={() => document.getElementById('file-input').click()}
                  style={{ cursor: 'pointer' }}
                />
              ) : (
                <div className="profile-picture-placeholder">
                  <button
                    className="set-profile-pic-button"
                    onClick={() => document.getElementById('file-input').click()}
                  >
                    Set Profile Picture
                  </button>
                </div>
              )}

              {/* Hidden input for file selection */}
              <input
                id="file-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleProfilePicChange}
              />

              {/* Profile username header */}
              <h2 className="profile-username">Your Picks</h2>
            </div>
          )}

          {renderSelectionSection(
            'East Playoff Teams (1-8)',
            selections.eastPlayoffTeams,
            'eastPlayoffTeams',
            true
          )}
          {renderSelectionSection(
            'West Playoff Teams (1-8)',
            selections.westPlayoffTeams,
            'westPlayoffTeams',
            true
          )}
          {renderFinalsSection(
            'Eastern Conference Final',
            selections.ecfWinner,
            selections.ecfLoser,
            'ecfWinner',
            'ecfLoser'
          )}
          {renderFinalsSection(
            'Western Conference Final',
            selections.wcfWinner,
            selections.wcfLoser,
            'wcfWinner',
            'wcfLoser'
          )}

          {renderSelectionSection('NBA Champion', [selections.nbaChampion], 'nbaChampion')}
          {renderSelectionSection(
            'Mid-Season Cup Champion',
            [selections.midSeasonCupChampion],
            'midSeasonCupChampion'
          )}

          {renderSelectionSection('NBA MVP', [selections.mvp], 'mvp')}
          {renderSelectionSection('Defensive Player of the Year', [selections.dpoy], 'dpoy')}
          {renderSelectionSection('Rookie of the Year', [selections.roty], 'roty')}
          {renderSelectionSection('Sixth Man of the Year', [selections.sixthMan], 'sixthMan')}
          {renderSelectionSection('Most Improved Player', [selections.mip], 'mip')}
          {renderSelectionSection(
            'Coach of the Year',
            [selections.coachOfTheYear],
            'coachOfTheYear'
          )}
          {renderSelectionSection('All-NBA First Team', selections.allNBAFirstTeam, 'allNBAFirstTeam')}
          {renderSelectionSection(
            'All-NBA Second Team',
            selections.allNBASecondTeam,
            'allNBASecondTeam'
          )}
          {renderSelectionSection(
            'All-NBA Third Team',
            selections.allNBAThirdTeam,
            'allNBAThirdTeam'
          )}
          {renderSelectionSection('All-Rookie Team', selections.allRookieTeam, 'allRookieTeam')}
          {renderSelectionSection('Worst NBA Team', [selections.worstTeam], 'worstTeam')}

          <div className="spin-the-wheel-container">
            {spunPlayer ? (
              <div className="selection-section">
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
        </div>
      )}

      {!selections && user && (
        <div>
          <p>No selections found. Make your picks!</p>
          <Link to="/make-picks">
            <button className="make-picks-button">Go to Make Picks</button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default MyPicks;
