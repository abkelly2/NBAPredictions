import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { FaHome } from 'react-icons/fa';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('Logged out successfully!');
    } catch (err) {
      console.error('Logout error:', err);
      alert('An error occurred during logout. Please try again.');
    }
  };

  return (
    <header className="header-container">
      <div className="header-content">
        {/* Home Button on the far left */}
        <Link to="/" className="go-home-button">
          <FaHome size={50} className="home-icon" />
        </Link>

        {/* Title in the center */}
        <div className="header-left">
          <h1 className="header-title">🏀 NBA Predictions 🏆</h1>
          <p className="header-subtitle">Your ultimate playoff and award picks</p>
        </div>

        {/* Bouncing basketball emojis */}

        {/* Stacked Buttons on the far right */}
        <div className="header-right">
          <div className="stacked-buttons">
            <Link to="/legacy" className="legacy-button">Legacy</Link>
            <Link to="/scoring" className="nav-button">Scoring</Link>
            {user && <button onClick={handleLogout} className="logout-button">Logout</button>}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
