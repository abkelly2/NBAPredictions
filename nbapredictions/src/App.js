// src/App.js
import React from 'react';
import Header from './components/Header';
import MyPicks from './components/MyPicks';
import OtherPicks from './components/OtherPicks';
import './components/Layout.css';

function App() {
  return (
    <div className="App">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="main-content">
        <div className="my-picks">
          <MyPicks />
        </div>
        <div className="other-picks">
          <OtherPicks />
        </div>
      </div>
    </div>
  );
}

export default App;
