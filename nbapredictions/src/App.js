// src/App.js
import React from 'react';
import Header from './components/Header';
import MyPicks from './components/MyPicks';
import OtherPicks from './components/OtherPicks';
import ViewPicks from './components/ViewPicks';
import SignUp from './components/SignUp';
import Login from './components/Login';
import MakePicks from './components/MakePicks'; // Import MakePicks component
import './components/Layout.css';
import Legacy from './components/Legacy';
import ScoringPage from './components/ScoringPage';  // Import the new Legacy page
import LeaderboardPage from './components/LeaderboardPage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Header */}
        <Header />

        {/* Routes */}
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/make-picks" element={<MakePicks />} /> {/* New Route for MakePicks */}
          <Route path="/picks/:userId" element={<ViewPicks />} />
          <Route path="/legacy" element={<Legacy />} />
          <Route path="/scoring" element={<ScoringPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />

        
          {/* Main content */}
          <Route
            path="/"
            element={
              <div className="main-content">
                <div className="my-picks">
                  <MyPicks />
                </div>
                <div className="other-picks">
                  <OtherPicks />
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
