// src/components/MyPicks.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { collection, doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function MyPicks() {
  // State for sign-up, login, and selections
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [selections, setSelections] = useState(null);

  // Convert the username to a "fake" email format
  const usernameToEmail = (username) => `${username}@example.com`;

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
      setUser(userCredential.user);
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
      // Set the auth persistence to session-based (keeps logged in until browser closes)
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

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, []);

  // Fetch user's picks from Firestore
  useEffect(() => {
    if (user) {
      const fetchPicks = async () => {
        const userDocRef = doc(collection(db, "picks"), user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          setSelections(docSnap.data().selections);
        } else {
          setSelections(null); // No selections found
        }
      };

      fetchPicks();
    }
  }, [user]);

  return (
    <div className="my-picks-box">
      <h2>Login to See Your Picks!</h2>
      {error && <p className="error-message">{error}</p>}
      
      {/* Sign-up and Login Forms */}
      {!user && (
        <div className="auth-forms">
          {/* Sign Up Section */}
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
              <button type="submit" className="auth-button">Sign Up</button>
            </form>
          </div>

          {/* Login Section */}
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
              <button type="submit" className="auth-button">Login</button>
            </form>
          </div>
        </div>
      )}

      {/* Display user's picks or message to make picks */}
      {user && (
        <div className="selections-box">
          {selections ? (
            <p>Your picks: {JSON.stringify(selections)}</p>
          ) : (
            <div>
              <p>Make your picks!</p>
              <Link to="/make-picks">
                <button className="make-picks-button">Go to Make Picks</button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MyPicks;
