// src/components/MakePicks.js
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM for the portal
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './MakePicks.css';

function MakePicks() {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState(''); // Use a single identifier
  const [searchBoxPosition, setSearchBoxPosition] = useState({ top: 0, left: 0 });

  const [eastPlayoffTeams, setEastPlayoffTeams] = useState(new Array(8).fill(null));
  const [westPlayoffTeams, setWestPlayoffTeams] = useState(new Array(8).fill(null));
  const [ecfWinner, setEcfWinner] = useState(null);
  const [wcfWinner, setWcfWinner] = useState(null);
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

  useEffect(() => {
    const fetchData = async () => {
      const teamsCollection = collection(db, 'nbaTeams');
      const playersCollection = collection(db, 'nbaPlayers');

      const teamsSnapshot = await getDocs(teamsCollection);
      const playersSnapshot = await getDocs(playersCollection);

      const teamsList = teamsSnapshot.docs.map(doc => doc.data().name);
      const playersList = playersSnapshot.docs.map(doc => doc.data().name);

      setTeams(teamsList);
      setPlayers(playersList);
    };

    fetchData();
  }, []);

  const getTeamImageFilename = (name) => `/team_images/${name.toLowerCase().replace(/ /g, '-')}.jpg`;
  const getPlayerImageFilename = (name) => {
    // Remove periods, commas, and handle "Jr."
    const sanitizedName = name
      .toLowerCase()
      .replace(/\./g, '')
      .replace(/\'/g, '') // Remove all periods
      .replace(/,/g, '')
      .replace(/\s+sr$/i, '') // Remove all commas
      .replace(/\s+jr$/i, ''); // Remove "jr" if it exists at the end
  
    return `/player_images/${sanitizedName.replace(/ /g, '-')}.jpg`;
  };
  

  const handleAddClick = (index, category, event) => {
    const rect = event.target.getBoundingClientRect();
    setSearchBoxPosition({ top: rect.top + window.scrollY, left: rect.left + window.scrollX });
    setSelectedId(`${category}-${index}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    const list = ['eastPlayoffTeams', 'westPlayoffTeams', 'ecfWinner', 'wcfWinner', 'worstTeam'].includes(selectedId.split('-')[0]) ? teams : players;
    setSearchResults(list.filter(item => item.toLowerCase().includes(e.target.value.toLowerCase())));
  };

  const handleSelectItem = (item) => {
    const category = selectedId.split('-')[0];
    const index = parseInt(selectedId.split('-')[1], 10);

    // Update state based on category
    switch (category) {
      case 'eastPlayoffTeams':
        setEastPlayoffTeams(prev => {
          const updated = [...prev];
          updated[index] = item;
          return updated;
        });
        break;
      case 'westPlayoffTeams':
        setWestPlayoffTeams(prev => {
          const updated = [...prev];
          updated[index] = item;
          return updated;
        });
        break;
      case 'ecfWinner':
        setEcfWinner(item);
        break;
      case 'wcfWinner':
        setWcfWinner(item);
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
        setAllNBAFirstTeam(prev => {
          const updated = [...prev];
          updated[index] = item;
          return updated;
        });
        break;
      case 'allNBASecondTeam':
        setAllNBASecondTeam(prev => {
          const updated = [...prev];
          updated[index] = item;
          return updated;
        });
        break;
      case 'allNBAThirdTeam':
        setAllNBAThirdTeam(prev => {
          const updated = [...prev];
          updated[index] = item;
          return updated;
        });
        break;
      case 'allRookieTeam':
        setAllRookieTeam(prev => {
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
        style={{ top: searchBoxPosition.top + 40, left: searchBoxPosition.left }} // Add offset for better positioning
      >
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <div className="search-results">
          {searchResults.map((result, idx) => (
            <div key={idx} className="search-result-item" onClick={() => handleSelectItem(result)}>
              <img
                src={
                  ['eastPlayoffTeams', 'westPlayoffTeams', 'ecfWinner', 'wcfWinner', 'worstTeam'].includes(category)
                    ? getTeamImageFilename(result)
                    : getPlayerImageFilename(result)
                }
                alt={result}
                className="search-team-image"
              />
              {result}
            </div>
          ))}
        </div>
      </div>,
      document.body // Portal renders to the root body
    );
  };

  const renderSelectionSection = (title, items, category, showRankings = false) => (
    <div className="selection-section">
      <h3>{title}</h3>
      <div className="team-selection">
        {items.map((item, index) => (
          <div key={index} className="team-slot">
            {/* Show ranking number if rankings are enabled */}
            {showRankings && (
              <div className="ranking-number">
                {index + 1}
              </div>
            )}
            {item ? (
              <div className="team-info">
                <img
                  src={
                    ['eastPlayoffTeams', 'westPlayoffTeams', 'ecfWinner', 'wcfWinner', 'worstTeam'].includes(category)
                      ? getTeamImageFilename(item)
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

  return (
    <div className="make-picks-container">
      <h2>Make Your Picks</h2>

      {/* East and West Playoff Teams Sections with Rankings */}
      {renderSelectionSection('East Playoff Teams (1-8)', eastPlayoffTeams, 'eastPlayoffTeams', true)}
      {renderSelectionSection('West Playoff Teams (1-8)', westPlayoffTeams, 'westPlayoffTeams', true)}

      {/* Other Sections without Rankings */}
      {renderSelectionSection('Eastern Conference Final Winner', [ecfWinner], 'ecfWinner')}
      {renderSelectionSection('Western Conference Final Winner', [wcfWinner], 'wcfWinner')}
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
    </div>
  );
}

export default MakePicks;