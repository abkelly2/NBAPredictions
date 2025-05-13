import React, { useEffect } from 'react';
import './ScoringPage.css'; // Custom styling for the scoring page

function ScoringPage() {
  useEffect(() => {
    // Any necessary effects can be added here
  }, []);

  return (
    <div className="scoring-page-container">
      {/* Header */}
      <header className="scoring-header">
        <h1 className="scoring-title">🏆 How Scoring Works 🏆</h1>
        <p className="scoring-subtitle">
          Explore each category to understand how your predictions earn points!
        </p>
      </header>

      {/* NBA Champion Section */}
      <section className="scoring-section">
        <div className="scoring-category">
          <h2>NBA Champion</h2>
          <p>If you correctly predict the NBA Champion, you earn 50 points!</p>
          <div className="champion-example">
            <div className="big-slot">
              Denver Nuggets <span>+50</span>
            </div>
          </div>
        </div>
      </section>

      {/* Playoff Teams Section */}
      <section className="scoring-section">
        <div className="scoring-category">
          <h2>Playoff Teams (East & West)</h2>
          <p>5 points for correct spot, 2 points for correct team but wrong spot.</p>
          <div className="playoff-teams-example">
            <div className="team-slot correct">
              <p>
                1. Bucks <span>+5</span>
              </p>
            </div>
            <div className="team-slot correct-spot-wrong-team">
              <p>
                2. Heat <span>+2</span>
              </p>
            </div>
            <div className="team-slot missed">
              <p>3. Bulls</p>
            </div>
            <div className="team-slot correct">
              <p>
                4. Celtics <span>+5</span>
              </p>
            </div>
            <div className="team-slot correct">
              <p>
                5. 76ers <span>+5</span>
              </p>
            </div>
            <div className="team-slot correct-spot-wrong-team">
              <p>
                6. Knicks <span>+2</span>
              </p>
            </div>
            <div className="team-slot correct">
              <p>
                7. Nets <span>+5</span>
              </p>
            </div>
            <div className="team-slot missed">
              <p>8. Pacers</p>
            </div>
          </div>
          <p>
            Max Points: <strong>+40</strong>
          </p>
        </div>
      </section>

      {/* ECF and WCF Section */}
      <section className="scoring-section">
        <div className="scoring-category">
          <h2>ECF & WCF + Winner</h2>
          <p>
            5 points for each correct team. Guess both teams correctly for an extra 3 points. Guess the
            winner correctly for another 3 points.
          </p>

          <div className="conference-finals-example">
            {/* First correct team */}
            <div className="finals-slot correct">
              <p>
                Bucks <span>+5</span>
              </p>
            </div>
            {/* Second correct team */}
            <div className="finals-slot correct">
              <p>
                Celtics <span>+5</span>
              </p>
            </div>
            {/* Bonus for both correct teams */}
            <div className="bonus-slot correct">
              <p>
                Both Correct <span>+3</span>
              </p>
            </div>
            {/* Correct winner */}
            <div className="winner-slot correct">
              <p>
                Bucks Win <span>+3</span>
              </p>
            </div>
          </div>
          <p>
            Max Points: <strong>+16</strong>
          </p>
        </div>
      </section>

      {/* MVP, DPOY, ROTY, Worst Team Section */}
      <section className="scoring-section">
        <div className="scoring-category">
          <h2>MVP, DPOY, ROTY, Worst NBA Team</h2>
          <p>Earn more points for predicting the rank of a player or team correctly.</p>

          <div className="ranking-example">
            {/* First List */}
            <div className="ranking-list">
              <p>
                <span className="rank">1.</span>{' '}
                <span className="correct">
                  Nikola Jokic <span>+15</span>
                </span>
              </p>
              <p>
                <span className="rank">2.</span> xxxxxx
              </p>
              <p>
                <span className="rank">3.</span> xxxxxx
              </p>
              <p>
                <span className="rank">4.</span> xxxxxx
              </p>
              <p>
                <span className="rank">5.</span> xxxxxx
              </p>
            </div>

            {/* Second List */}
            <div className="ranking-list">
              <p>
                <span className="rank">1.</span> xxxxxx
              </p>
              <p>
                <span className="rank">2.</span> xxxxxx
              </p>
              <p>
                <span className="rank">3.</span>{' '}
                <span className="correct">
                  Nikola Jokic <span>+9</span>
                </span>
              </p>
              <p>
                <span className="rank">4.</span> xxxxxx
              </p>
              <p>
                <span className="rank">5.</span> xxxxxx
              </p>
            </div>

            {/* Third List */}
            <div className="ranking-list">
              <p>
                <span className="rank">1.</span> xxxxxx
              </p>
              <p>
                <span className="rank">2.</span> xxxxxx
              </p>
              <p>
                <span className="rank">3.</span> xxxxxx
              </p>
              <p>
                <span className="rank">4.</span> xxxxxx
              </p>
              <p>
                <span className="rank">5.</span>{' '}
                <span className="correct">
                  Nikola Jokic <span>+3</span>
                </span>
              </p>
            </div>
          </div>
          <p>
            Max Points: <strong>+15</strong>
          </p>
        </div>
      </section>

      {/* All-NBA Teams */}
      <section className="scoring-section">
        <div className="scoring-category">
          <h2>All-NBA Teams</h2>
          <p>
            Correct player on the right team: +3 points. Wrong team, but right player: +1 point.
          </p>
          <div className="all-nba-teams-example">
            {/* Yuki Kawamura */}
            <div className="team-slot missed">
              <p>Yuki Kawamura</p>
            </div>

            {/* LeBron James - Second Team */}
            <div className="team-slot correct-spot-wrong-team">
              <p>
                LeBron James <span>+1</span>
              </p>
              <small>Made 2nd Team</small>
            </div>

            {/* Nikola Jokic - First Team */}
            <div className="team-slot correct">
              <p>
                Nikola Jokic <span>+3</span>
              </p>
            </div>

            {/* Joel Embiid - First Team */}
            <div className="team-slot correct">
              <p>
                Joel Embiid <span>+3</span>
              </p>
            </div>

            {/* Jayson Tatum - Second Team */}
            <div className="team-slot correct-spot-wrong-team">
              <p>
                Jayson Tatum <span>+1</span>
              </p>
              <small>Made 2nd Team</small>
            </div>
          </div>
          <p>
            Max Points: <strong>+45</strong>
          </p>
        </div>
      </section>

      {/* 6th Man, MIP, Coach of the Year Section */}
      <section className="scoring-section">
        <div className="scoring-category">
          <h2>6th Man, MIP, and Coach of the Year</h2>
          <p>Each correct prediction earns 10 points.</p>

          <div className="award-example">
            {/* 6th Man */}
            <div className="award-slot correct">
              <p>
                6th Man: Malcolm Brogdon <span>+10</span>
              </p>
            </div>

            {/* Most Improved Player */}
            <div className="award-slot missed">
              <p>MIP: Tyrese Haliburton</p>
            </div>

            {/* Coach of the Year */}
            <div className="award-slot correct">
              <p>
                Coach of the Year: Taylor Jenkins <span>+10</span>
              </p>
            </div>
          </div>
          <p>
            Max Points: <strong>+10</strong>
          </p>
        </div>
      </section>

      {/* Midseason Cup */}
      <section className="scoring-section">
        <div className="scoring-category">
          <h2>Midseason Cup</h2>
          <p>20 points if guessed correctly, 10 points for runner-up.</p>
          <div className="midseason-cup-example">
            <div className="cup-slot correct">
              <p>
                Bucks Win <span>+20</span>
              </p>
            </div>
            <div className="cup-slot runner-up">
              <p>
                Bucks Runner-Up <span>+10</span>
              </p>
            </div>
          </div>
          <p>
            Max Points: <strong>+20</strong>
          </p>
        </div>
      </section>

      {/* Wheel Spinning Category */}
      <section className="scoring-section">
        <div className="scoring-category">
          <h2>Wheel Spinning Category</h2>
          <p>
            Spin the wheel to get a random NBA player. The player's Points Per Game (PPG) at the end of
            the season is how many points you earn!
          </p>
          <div className="wheel-spinning-example">
            <div className="wheel-player">
              <p>
                You spun: <strong>Stephen Curry</strong>
              </p>
              <p>
                End of Season PPG: <strong>29.5</strong>
              </p>
              <p>
                You earn: <span>+29.5</span> points!
              </p>
            </div>
          </div>
          <p>
            Max Points: <strong>Varies</strong>
          </p>
        </div>
      </section>

      {/* Points Summary */}
      <section className="points-summary">
        <h3>
          Maximum Total Points: <span className="total-points">+302</span>
        </h3>
      </section>
    </div>
  );
}

export default ScoringPage;
