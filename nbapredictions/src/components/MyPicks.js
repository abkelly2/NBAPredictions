import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { Link } from 'react-router-dom';
import './MakePicks.css';
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
  const [hasSpun, setHasSpun] = useState(false); // Tracks if the user has spun the wheel
  const [wheelData, setWheelData] = useState([]); // Data for the wheel
  const [mustSpin, setMustSpin] = useState(false); // Determines if the wheel is spinning
  const [prizeNumber, setPrizeNumber] = useState(0); // State for the spun player
  const [players, setPlayers] = useState([]);
  const [coaches, setCoaches] = useState([]); // New state for coaches
  const [profilePicUrl, setProfilePicUrl] = useState(''); // Add this line to store the profile picture URL
  const [showConfetti, setShowConfetti] = useState(false); // For the confetti effect
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const usernameToEmail = (username) => `${username}@example.com`;
  const getPlayerImageFilename = (name) => `/player_images/${name.toLowerCase().replace(/ /g, '-')}.jpg`;
  const auth = getAuth();
  const currentUser = auth.currentUser; // Get the current logged-in user
  // Handle profile picture change
  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (file) {
      try {
        const user = auth.currentUser; // Get the currently logged-in user
        
        // Check if user is authenticated
        if (!user) {
          throw new Error("User is not authenticated.");
        }
        
        const profilePicRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(profilePicRef, file); // Upload the file to Firebase Storage
        const newProfilePicUrl = await getDownloadURL(profilePicRef); // Get the URL of the uploaded file
    
        // Add a timestamp query parameter to the URL to prevent caching issues
        const timestampedProfilePicUrl = `${newProfilePicUrl}?t=${new Date().getTime()}`;
    
        // Reference the user profile document in Firestore
        const userProfileDocRef = doc(db, 'userProfiles', user.uid);
        const docSnap = await getDoc(userProfileDocRef); // Check if the document exists
    
        if (docSnap.exists()) {
          // Update the document with the new profile picture URL if it exists
          await updateDoc(userProfileDocRef, { profilePicUrl: timestampedProfilePicUrl });
        } else {
          // Create the document with the new profile picture URL if it doesn't exist
          await setDoc(userProfileDocRef, {
            username: user.email,
            profilePicUrl: timestampedProfilePicUrl,
          });
        }
    
        // Update the state with the new profile picture URL
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
      await uploadBytes(profilePicRef, profilePic); // Upload the file to Firebase Storage
      const profilePicUrl = await getDownloadURL(profilePicRef); // Get the URL of the uploaded file

      // Add the profile picture URL to the user's Firestore document
      await updateDoc(doc(db, 'userProfiles', user.uid), {
        profilePicUrl,
      });

      // Update the profile picture URL in the state
      setProfilePicUrl(profilePicUrl);
    } catch (error) {
      console.error('Error uploading profile picture after sign up:', error);
    }
  }
};


  // Handle sign-up
  // Handle sign-up
const handleSignUp = async (e) => {
  e.preventDefault();
  setError('');

  if (signUpPassword.length < 6) {
    setError('Password should be at least 6 characters long.');
    return;
  }

  try {
    // Sign up the user and authenticate them
    const userCredential = await createUserWithEmailAndPassword(auth, usernameToEmail(signUpUsername), signUpPassword);
    const user = userCredential.user;

    // Create a Firestore document for the user profile (without profilePicUrl yet)
    await setDoc(doc(db, 'userProfiles', user.uid), {
      username: `${signUpUsername.toLowerCase()}@example.com`,
      profilePicUrl: '', // Profile pic will be updated later
    });

    // Upload the profile picture after authentication
    await uploadProfilePicAfterSignUp(user);

    setUser(user); // Update the user state
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
      const userCredential = await signInWithEmailAndPassword(auth, usernameToEmail(loginUsername), loginPassword);
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
        const auth = getAuth(); // Get the auth object
    const currentUser = auth.currentUser; // Access the current user
    

    if (currentUser) {
      const profilesQuery = query(collection(db, 'userProfiles'), where('username', '==', user.email));
      const profilesSnapshot = await getDocs(profilesQuery);

      if (!profilesSnapshot.empty) {
        const profileDoc = profilesSnapshot.docs[0];
        setProfilePicUrl(profileDoc.data().profilePicUrl); // Fetch profile picture for logged-in user
      }
    }
        

        const username = user.email; 
        console.log('Fetching picks for username:', username);

        const picksQuery = query(collection(db, 'userPicks'), where('username', '==', username));
        const querySnapshot = await getDocs(picksQuery);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          console.log('Selections found:', docSnap.data());
          setSelections(docSnap.data());

          const spinsQuery = query(collection(db, 'userSpins'), where('username', '==', username));
          const spinsSnapshot = await getDocs(spinsQuery);
          if (!spinsSnapshot.empty) {
            const spinDoc = spinsSnapshot.docs[0];
            setSpunPlayer(spinDoc.data().spunPlayer); // Set spun player
          }
        } else {
          console.log('No selections found for username:', username);
          setSelections(null);
        }
      };

      fetchPicks();
    }
  }, [user]);

  // Fetch teams, players, and coaches
  useEffect(() => {
    const fetchData = async () => {

      if (!currentUser || !currentUser.email) {
        console.error("User is not logged in.");
        return; // Exit early if no user is logged in
      }
      
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
      setCoaches(coachesList);// Save coaches list with formatted name and team
      
      const formattedWheelData = playersList.map(player => ({
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
    


    };

    fetchData();
  }, [currentUser]);




  const handleSpinWheel = () => {
    if (hasSpun) {
      alert('You have already spun the wheel!');
      return;
    }

    // Randomly select a prize index (player)
    const newPrizeNumber = Math.floor(Math.random() * wheelData.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true); // Start the wheel spin
  };

  const handleSpinComplete = () => {
    const randomPlayer = wheelData[prizeNumber].option;
    setSpunPlayer(randomPlayer);
    setHasSpun(true); // Mark as spun
    setShowConfetti(true); // Show confetti

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
    event.stopPropagation(); // Prevent the click from affecting other elements
    const rect = event.target.getBoundingClientRect();
    setSearchBoxPosition({ top: rect.top + window.scrollY, left: rect.left + window.scrollX });
    setSelectedId(`${category}-${index}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    const list = ['eastPlayoffTeams', 'westPlayoffTeams', 'ecfWinner', 'ecfLoser', 'wcfWinner', 'wcfLoser', 'nbaChampion', 'midSeasonCupChampion', 'worstTeam'].includes(selectedId.split('-')[0]) 
      ? teams 
      : selectedId.split('-')[0] === 'coachOfTheYear' 
        ? coaches 
        : players;
  
    setSearchResults(list.filter(item => item.toLowerCase().includes(e.target.value.toLowerCase())));
  };

  const handleSelectItem = (item) => {
    const category = selectedId.split('-')[0];
    const index = parseInt(selectedId.split('-')[1], 10);
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

    // Update selections based on category
    setSelections(prev => {
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
      .replace(/ - /g, '-') // Replace ' - ' with a single hyphen
      .replace(/ /g, '-') // Replace spaces with hyphens
      + '.jpg'; // Append .jpg extension
  };

  const renderSearchBox = (index, category) => {
    return ReactDOM.createPortal(
      <div className="search-box" style={{ top: searchBoxPosition.top + 40, left: searchBoxPosition.left }} onClick={(e) => e.stopPropagation()}>
        <input 
          type="text" 
          placeholder="Search..." 
          value={searchQuery} 
          onChange={handleSearchChange} 
          onClick={(e) => e.stopPropagation()} // Prevent the click from closing or moving the search box
        />
        <div className="search-results">
          {searchResults.map((result, idx) => {
            const formattedCoachName = formatCoachImageFilename(result); // Ensure coach name is formatted correctly
            return (
              <div key={idx} className="search-result-item" onClick={() => handleSelectItem(result)}>
                <img
                  src={
                    category === 'coachOfTheYear'
                      ? `/coach_images/${formattedCoachName}` // Use the formatted name for the image URL
                      : ['eastPlayoffTeams', 'westPlayoffTeams', 'ecfWinner', 'ecfLoser', 'wcfWinner', 'wcfLoser', 'nbaChampion', 'midSeasonCupChampion', 'worstTeam'].includes(category)
                      ? `/team_images/${result.toLowerCase().replace(/ /g, '-')}.jpg`
                      : `/player_images/${result.toLowerCase().replace(/ /g, '-')}.jpg`
                  }
                  alt={result}
                  className="search-team-image"
                />
                {result}
              </div>
            );
          })}
        </div>
      </div>,
      document.body
    );
  };

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
            </div>
          </div>
        </div>
      </div>
    )
  );
  


  
  const renderSelectionSection = (title, items, category, showRankings = false) => (
    <div className="selection-section">
      <h3>{title}</h3>
      <div className="team-selection">
        {items.map((item, index) => (
          <div key={index} className="team-slot" onClick={(event) => handleAddClick(index, category, event)}>
            {showRankings && <div className="ranking-number">{index + 1}</div>}
            {item ? (
              <div className="team-info">
                <img
                  src={
                    category === 'coachOfTheYear'
                      ? `/coach_images/${formatCoachImageFilename(item)}` // Coach images
                      : ['eastPlayoffTeams', 'westPlayoffTeams', 'ecfWinner', 'ecfLoser', 'wcfWinner', 'wcfLoser', 'nbaChampion', 'midSeasonCupChampion', 'worstTeam'].includes(category)
                      ? `/team_images/${item.toLowerCase().replace(/ /g, '-')}.jpg` // Team images
                      : `/player_images/${item.toLowerCase().replace(/ /g, '-')}.jpg` // Player images
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
  
  
  


  // Handle saving selections
  const saveSelections = async () => {

    if (!currentUser || !currentUser.email) {
      alert('User is not logged in or email is missing.');
      return;
    }

    console.log("1");
    if (user && selections) {
      console.log("2");
      const username = currentUser.email;
      console.log(username);
      const picksQuery = query(collection(db, 'userPicks'), where('username', '==', username));
      console.log("3");
      const querySnapshot = await getDocs(picksQuery);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref; // Get the reference to the document
        await updateDoc(docRef, selections); // Update the document with the new selections
        alert('Selections saved successfully!');
      } else {
        alert('Error: Could not find user selections to update.');
      }
    }
  };

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

  return (
    <div className="my-picks-box">
      {!user && (
        <div className="auth-forms">
          <div className="auth-section">
            <h3>Sign Up</h3>
            <form onSubmit={handleSignUp} className="auth-form">
              <input type="text" placeholder="Username" value={signUpUsername} onChange={(e) => setSignUpUsername(e.target.value)} required />
              <input type="password" placeholder="Password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} required />
              <input type="file" accept="image/*" onChange={handleProfilePicChange} />
              <button type="submit" className="auth-button">Sign Up</button>
            </form>
          </div>

          <div className="auth-section">
            <h3>Login</h3>
            <form onSubmit={handleLogin} className="auth-form">
              <input type="text" placeholder="Username" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} required />
              <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
              <button type="submit" className="auth-button">Login</button>
            </form>
          </div>
        </div>
      )}

      {user && selections && (
        <div className="make-picks-container">
          {user && (
  <div className="profile-header">
    {/* If the user has a profile picture, show it */}
    {profilePicUrl ? (
      <img
        src={profilePicUrl}
        alt="Profile"
        className="profile-picture-large"
        onClick={() => document.getElementById('file-input').click()} // Trigger file input on click
        style={{ cursor: 'pointer' }} // Make it clear it's clickable
      />
    ) : (
      /* If no profile picture, show a large button to upload one */
      <div className="profile-picture-placeholder">
        <button
          className="set-profile-pic-button"
          onClick={() => document.getElementById('file-input').click()} // Trigger file input on click
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
      style={{ display: 'none' }} // Hide the file input
      onChange={handleProfilePicChange} // Call function to handle the file change
    />
    
    {/* Profile username header */}
    <h2 className="profile-username">Your Picks</h2>
  </div>
)}

          
          {renderSelectionSection('East Playoff Teams (1-8)', selections.eastPlayoffTeams, 'eastPlayoffTeams', true)}
          {renderSelectionSection('West Playoff Teams (1-8)', selections.westPlayoffTeams, 'westPlayoffTeams', true)}
          {renderFinalsSection('Eastern Conference Final', selections.ecfWinner, selections.ecfLoser, 'ecfWinner', 'ecfLoser')}
          {renderFinalsSection('Western Conference Final', selections.wcfWinner, selections.wcfLoser, 'wcfWinner', 'wcfLoser')}

          {renderSelectionSection('NBA Champion', [selections.nbaChampion], 'nbaChampion')}
{renderSelectionSection('Mid-Season Cup Champion', [selections.midSeasonCupChampion], 'midSeasonCupChampion')}




          {renderSelectionSection('NBA MVP', [selections.mvp], 'mvp')}
          {renderSelectionSection('Defensive Player of the Year', [selections.dpoy], 'dpoy')}
          {renderSelectionSection('Rookie of the Year', [selections.roty], 'roty')}
          {renderSelectionSection('Sixth Man of the Year', [selections.sixthMan], 'sixthMan')}
          {renderSelectionSection('Most Improved Player', [selections.mip], 'mip')}
          {renderSelectionSection('Coach of the Year', [selections.coachOfTheYear], 'coachOfTheYear')} {/* Updated for Coach */}
          {renderSelectionSection('All-NBA First Team', selections.allNBAFirstTeam, 'allNBAFirstTeam')}
          {renderSelectionSection('All-NBA Second Team', selections.allNBASecondTeam, 'allNBASecondTeam')}
          {renderSelectionSection('All-NBA Third Team', selections.allNBAThirdTeam, 'allNBAThirdTeam')}
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
                  onStopSpinning={handleSpinComplete}
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

          




          

          {/* Save Selections Button */}
          <button className="lock-selections-button" onClick={saveSelections}>
            Save Selections
          </button>
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
