import React, { useEffect } from 'react';
import './Legacy.css';

const Legacy = () => {
  const winners = [
    {
      name: 'Maddy Ryan',
      year: '2024',
      picks: ['MVP: Nikola Jokic', 'ECF: Celtics vs Caveliers', 'WCF: Nuggests vs Mavericks', 'NBA Champion: Boston Celtics', 'Worst Team: Rockets'],
    }
  ];

  useEffect(() => {
    const trophyRain = document.createElement('div');
    trophyRain.classList.add('trophy-rain');
    document.body.appendChild(trophyRain);

    for (let i = 0; i < 50; i++) {
      const trophy = document.createElement('div');
      trophy.classList.add('trophy-emoji');
      trophy.textContent = '🏆';
      trophy.style.left = `${Math.random() * 100}vw`;
      trophy.style.animationDelay = `${Math.random() * 10}s`;
      trophyRain.appendChild(trophy);
    }

    return () => {
      trophyRain.remove();
    };
  }, []);

  return (
    <div className="legacy-container">
      <h1 className="legacy-title">🏆 The Hall of Champions 🏆</h1>
      <p className="legacy-subtitle">Celebrating Greatness, Glory, and the Legends</p>
      <div className="winners-gallery">
        {winners.map((winner, index) => (
          <div key={index} className="winner-card">
            <div className="winner-header">
              <div className="winner-name">{winner.name}</div>
              <div className="winner-year">{winner.year}</div>
            </div>
            <div className="picks-container">
              {winner.picks.map((pick, i) => (
                <div key={i} className="pick-item">{pick}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legacy;
