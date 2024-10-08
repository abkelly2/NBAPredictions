import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { Link } from 'react-router-dom';
import './MakePicks.css';
import ReactDOM from 'react-dom';

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
  const [players, setPlayers] = useState([]);
  const [coaches, setCoaches] = useState([]); // New state for coaches

  const usernameToEmail = (username) => `${username}@example.com`;

  // Handle profile picture change
  const handleProfilePicChange = (e) => {
    setProfilePic(e.target.files[0]);
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
      const userCredential = await createUserWithEmailAndPassword(auth, usernameToEmail(signUpUsername), signUpPassword);
      const user = userCredential.user;

      let profilePicUrl = '';
      if (profilePic) {
        const profilePicRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(profilePicRef, profilePic);
        profilePicUrl = await getDownloadURL(profilePicRef);
      }

      await setDoc(doc(db, 'userProfiles', user.uid), {
        username: signUpUsername,
        profilePicUrl,
      });

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
        if (!user) return;

        const username = user.email; 
        console.log('Fetching picks for username:', username);

        const picksQuery = query(collection(db, 'userPicks'), where('username', '==', username));
        const querySnapshot = await getDocs(picksQuery);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          console.log('Selections found:', docSnap.data());
          setSelections(docSnap.data());
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
      setCoaches(coachesList); // Save coaches list with formatted name and team
    };

    fetchData();
  }, []);

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
    const list = ['eastPlayoffTeams', 'westPlayoffTeams', 'ecfWinner', 'wcfWinner', 'worstTeam'].includes(selectedId.split('-')[0]) 
      ? teams 
      : selectedId.split('-')[0] === 'coachOfTheYear' 
        ? coaches // If it's the coach category, search in the coaches list
        : players;
    
    setSearchResults(list.filter(item => item.toLowerCase().includes(e.target.value.toLowerCase())));
  };

  const handleSelectItem = (item) => {
    const category = selectedId.split('-')[0];
    const index = parseInt(selectedId.split('-')[1], 10);

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
  
  const capitalizeFirstLetter = (str) => {
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('_');
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
          {searchResults.map((result, idx) => (
            <div key={idx} className="search-result-item" onClick={() => handleSelectItem(result)}>
              <img
                src={
                  category === 'coachOfTheYear'
                    ? `/coach_images/${capitalizeFirstLetter(result.toLowerCase().replace(/ /g, '_').replace(/-/g, ''))}.jpg` // Capitalize coach names
                    : ['eastPlayoffTeams', 'westPlayoffTeams', 'ecfWinner', 'wcfWinner', 'worstTeam'].includes(category)
                    ? `/team_images/${result.toLowerCase().replace(/ /g, '-')}.jpg`
                    : `/player_images/${result.toLowerCase().replace(/ /g, '-')}.jpg`
                }
                alt={result}
                className="search-team-image"
              />
              {result}
            </div>
          ))}
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
          <div key={index} className="team-slot" onClick={(event) => handleAddClick(index, category, event)}>
            {showRankings && <div className="ranking-number">{index + 1}</div>}
            {item ? (
              <div className="team-info">
                <img
                  src={
                    category === 'coachOfTheYear'
                      ? `/coach_images/${item.toLowerCase().replace(/ /g, '_').replace(/-/g, '')}.jpg`
                      : ['eastPlayoffTeams', 'westPlayoffTeams', 'ecfWinner', 'wcfWinner', 'worstTeam'].includes(category)
                      ? `/team_images/${item.toLowerCase().replace(/ /g, '-')}.jpg`
                      : `/player_images/${item.toLowerCase().replace(/ /g, '-')}.jpg`
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
    if (user && selections) {
      const username = user.email;
      const picksQuery = query(collection(db, 'userPicks'), where('username', '==', username));
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
          <h2>Your Picks</h2>
          {renderSelectionSection('East Playoff Teams (1-8)', selections.eastPlayoffTeams, 'eastPlayoffTeams', true)}
          {renderSelectionSection('West Playoff Teams (1-8)', selections.westPlayoffTeams, 'westPlayoffTeams', true)}
          {renderSelectionSection('Eastern Conference Final Winner', [selections.ecfWinner], 'ecfWinner')}
          {renderSelectionSection('Western Conference Final Winner', [selections.wcfWinner], 'wcfWinner')}
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
