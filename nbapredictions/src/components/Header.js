// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { FaHome } from 'react-icons/fa';

function Header() {
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
        </div>
      </div>
    </header>
  );
}

export default Header;
