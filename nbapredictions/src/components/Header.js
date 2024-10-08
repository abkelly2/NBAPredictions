// src/components/Header.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { FaHome } from 'react-icons/fa';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function Header() {
  const [user, setUser] = useState(null);

  // Listen for auth state changes to detect if a user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Handle logout
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
        <div className="header-left">
          <h1 className="header-title">NBA Predictions</h1>
          <p className="header-subtitle">Your ultimate playoff and award picks</p>
        </div>
        <div className="header-right">
          <Link to="/" className="go-home-button">
            <FaHome size={20} className="home-icon" /> Go Home
          </Link>

          {/* Logout button shows only if a user is logged in */}
          {user && (
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
