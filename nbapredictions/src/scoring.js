// Scoring weights for different categories
export const SCORING_WEIGHTS = {
  // NBA Champion
  champion: 3,
  
  // Playoff Teams
  eastPlayoffTeam: 5,  // Correct position
  westPlayoffTeam: 5,  // Correct position
  playoffTeamWrongPosition: 2,  // Wrong position
  
  // Conference Finals
  eastFinals: 5,  // Per correct team
  westFinals: 5,  // Per correct team
  conferenceFinalsBonus: 5,  // Bonus for getting both teams right
  
  // Individual Awards
  mvp: 15,  // Winner
  mvpSecond: 12,  // 2nd place
  mvpThird: 9,  // 3rd place
  mvpFourth: 6,  // 4th place
  mvpFifth: 3,  // 5th place
  
  // All-NBA Teams
  allNbaFirst: 2,
  allNbaSecond: 1,
  allNbaThird: 1,
  
  // Other Categories
  worstTeam: 5,  // Worst team
  worstTeamSecond: 4,  // 2nd worst
  worstTeamThird: 3,  // 3rd worst
  worstTeamFourth: 2,  // 4th worst
  worstTeamFifth: 1,  // 5th worst
  
  // Mid-Season Cup
  midSeasonCupChampion: 20,
  midSeasonCupRunnerUp: 10
};

// Calculate points for playoff teams
function calculatePlayoffPoints(userPicks, actualResults) {
  let points = 0;
  
  // East playoff teams
  const userEastTeams = userPicks.eastPlayoffTeams;
  const actualEastTeams = actualResults.eastPlayoffTeams;
  
  // Check each position in the East
  for (let i = 0; i < userEastTeams.length; i++) {
    const userTeam = userEastTeams[i];
    const actualTeam = actualEastTeams[i];
    
    if (userTeam === actualTeam) {
      // Correct team in correct position
      points += SCORING_WEIGHTS.eastPlayoffTeam;
    } else if (actualEastTeams.includes(userTeam)) {
      // Team made playoffs but wrong position
      points += SCORING_WEIGHTS.playoffTeamWrongPosition;
    }
  }
  
  // West playoff teams
  const userWestTeams = userPicks.westPlayoffTeams;
  const actualWestTeams = actualResults.westPlayoffTeams;
  
  // Check each position in the West
  for (let i = 0; i < userWestTeams.length; i++) {
    const userTeam = userWestTeams[i];
    const actualTeam = actualWestTeams[i];
    
    if (userTeam === actualTeam) {
      // Correct team in correct position
      points += SCORING_WEIGHTS.westPlayoffTeam;
    } else if (actualWestTeams.includes(userTeam)) {
      // Team made playoffs but wrong position
      points += SCORING_WEIGHTS.playoffTeamWrongPosition;
    }
  }
  
  return points;
}

// Calculate points for conference finals
function calculateConferenceFinalsPoints(userPicks, actualResults) {
  let points = 0;
  console.log('Calculating conference finals points...');
  
  // East Finals
  const eastCorrectTeams = [];
  if (userPicks.ecfWinner === actualResults.eastFinals[0] || userPicks.ecfWinner === actualResults.eastFinals[1]) {
    points += SCORING_WEIGHTS.eastFinals;
    eastCorrectTeams.push(userPicks.ecfWinner);
  }
  if (userPicks.ecfLoser === actualResults.eastFinals[0] || userPicks.ecfLoser === actualResults.eastFinals[1]) {
    points += SCORING_WEIGHTS.eastFinals;
    eastCorrectTeams.push(userPicks.ecfLoser);
  }
  // Bonus for getting both teams right
  if (eastCorrectTeams.length === 2) {
    points += SCORING_WEIGHTS.conferenceFinalsBonus;
  }
  
  // West Finals
  const westCorrectTeams = [];
  if (userPicks.wcfWinner === actualResults.westFinals[0] || userPicks.wcfWinner === actualResults.westFinals[1]) {
    points += SCORING_WEIGHTS.westFinals;
    westCorrectTeams.push(userPicks.wcfWinner);
  }
  if (userPicks.wcfLoser === actualResults.westFinals[0] || userPicks.wcfLoser === actualResults.westFinals[1]) {
    points += SCORING_WEIGHTS.westFinals;
    westCorrectTeams.push(userPicks.wcfLoser);
  }
  // Bonus for getting both teams right
  if (westCorrectTeams.length === 2) {
    points += SCORING_WEIGHTS.conferenceFinalsBonus;
  }
  
  console.log('Total conference finals points:', points);
  return points;
}

// Calculate points for individual awards
function calculateIndividualAwardsPoints(userPicks, actualResults) {
  let points = 0;
  console.log('Calculating individual awards points...');
  
  // Helper function to calculate points based on position
  const calculateAwardPoints = (userPick, actualResults, awardName) => {
    console.log(`Calculating ${awardName} points...`);
    console.log('User pick:', userPick);
    console.log('Actual results:', actualResults);
    
    const position = actualResults.indexOf(userPick);
    let awardPoints = 0;
    
    if (position === 0) awardPoints = SCORING_WEIGHTS.mvp;
    if (position === 1) awardPoints = SCORING_WEIGHTS.mvpSecond;
    if (position === 2) awardPoints = SCORING_WEIGHTS.mvpThird;
    if (position === 3) awardPoints = SCORING_WEIGHTS.mvpFourth;
    if (position === 4) awardPoints = SCORING_WEIGHTS.mvpFifth;
    
    console.log(`${awardName} position:`, position, 'Points:', awardPoints);
    return awardPoints;
  };

  // MVP
  if (userPicks.mvp && actualResults.mvp) {
    points += calculateAwardPoints(userPicks.mvp, actualResults.mvp, 'MVP');
  }

  // DPOY
  if (userPicks.dpoy && actualResults.dpoy) {
    points += calculateAwardPoints(userPicks.dpoy, actualResults.dpoy, 'DPOY');
  }

  // ROY (handle both roty and roy)
  if (userPicks.roty && actualResults.roy) {
    points += calculateAwardPoints(userPicks.roty, actualResults.roy, 'ROY');
  }

  // MIP
  if (userPicks.mip && actualResults.mip) {
    points += calculateAwardPoints(userPicks.mip, actualResults.mip, 'MIP');
  }

  // SMOY
  if (userPicks.smoy && actualResults.smoy) {
    points += calculateAwardPoints(userPicks.smoy, actualResults.smoy, 'SMOY');
  }

  // COTY
  if (userPicks.coty && actualResults.coty) {
    points += calculateAwardPoints(userPicks.coty, actualResults.coty, 'COTY');
  }
  
  console.log('Total individual awards points:', points);
  return points;
}

// Calculate points for All-NBA teams
function calculateAllNBAPoints(userPicks, actualResults) {
  let points = 0;
  console.log('Calculating All-NBA points...');
  
  // First Team
  if (userPicks.allNBAFirstTeam && actualResults.allNbaFirst) {
    const userFirstTeam = new Set(userPicks.allNBAFirstTeam);
    const actualFirstTeam = new Set(actualResults.allNbaFirst);
    const correctFirstTeam = [...userFirstTeam].filter(player => actualFirstTeam.has(player));
    points += correctFirstTeam.length * SCORING_WEIGHTS.allNbaFirst;
    console.log('First team correct picks:', correctFirstTeam.length, 'Points:', correctFirstTeam.length * SCORING_WEIGHTS.allNbaFirst);
  }
  
  // Second Team
  if (userPicks.allNBASecondTeam && actualResults.allNbaSecond) {
    const userSecondTeam = new Set(userPicks.allNBASecondTeam);
    const actualSecondTeam = new Set(actualResults.allNbaSecond);
    const correctSecondTeam = [...userSecondTeam].filter(player => actualSecondTeam.has(player));
    points += correctSecondTeam.length * SCORING_WEIGHTS.allNbaSecond;
    console.log('Second team correct picks:', correctSecondTeam.length, 'Points:', correctSecondTeam.length * SCORING_WEIGHTS.allNbaSecond);
  }
  
  // Third Team
  if (userPicks.allNBAThirdTeam && actualResults.allNbaThird) {
    const userThirdTeam = new Set(userPicks.allNBAThirdTeam);
    const actualThirdTeam = new Set(actualResults.allNbaThird);
    const correctThirdTeam = [...userThirdTeam].filter(player => actualThirdTeam.has(player));
    points += correctThirdTeam.length * SCORING_WEIGHTS.allNbaThird;
    console.log('Third team correct picks:', correctThirdTeam.length, 'Points:', correctThirdTeam.length * SCORING_WEIGHTS.allNbaThird);
  }
  
  console.log('Total All-NBA points:', points);
  return points;
}

// Calculate points for mid-season cup
function calculateMidSeasonCupPoints(userPicks, actualResults) {
  let points = 0;
  console.log('Calculating mid-season cup points...');
  console.log('User pick:', userPicks.midSeasonCupChampion);
  console.log('Actual results:', actualResults.midSeasonCupChampion);
  
  if (userPicks.midSeasonCupChampion === actualResults.midSeasonCupChampion[0]) {
    points += SCORING_WEIGHTS.midSeasonCupChampion;
    console.log('Added champion points:', SCORING_WEIGHTS.midSeasonCupChampion);
  } else if (userPicks.midSeasonCupChampion === actualResults.midSeasonCupChampion[1]) {
    points += SCORING_WEIGHTS.midSeasonCupRunnerUp;
    console.log('Added runner-up points:', SCORING_WEIGHTS.midSeasonCupRunnerUp);
  }
  
  console.log('Total mid-season cup points:', points);
  return points;
}

// Calculate points for spun player based on PPG
function calculateSpunPlayerPoints(userPicks, actualResults) {
  if (!userPicks || !actualResults || !actualResults.playerPPG) return 0;
  
  // Get the spun player from the user picks
  const spunPlayer = userPicks.spunPlayer;
  if (!spunPlayer) return 0;
  
  // Get the PPG value directly from the actual results
  const ppg = actualResults.playerPPG[spunPlayer];
  if (typeof ppg === 'number' && !isNaN(ppg)) {
    return Math.round(ppg);
  }
  
  return 0;
}

// Calculate points for worst team
function calculateWorstTeamPoints(userPicks, actualResults) {
  let points = 0;
  console.log('Calculating worst team points...');
  console.log('User pick:', userPicks.worstTeam);
  console.log('Actual results:', actualResults.worstTeam);
  
  if (userPicks.worstTeam && actualResults.worstTeam) {
    const position = actualResults.worstTeam.indexOf(userPicks.worstTeam);
    if (position === 0) points += SCORING_WEIGHTS.worstTeam;
    if (position === 1) points += SCORING_WEIGHTS.worstTeamSecond;
    if (position === 2) points += SCORING_WEIGHTS.worstTeamThird;
    if (position === 3) points += SCORING_WEIGHTS.worstTeamFourth;
    if (position === 4) points += SCORING_WEIGHTS.worstTeamFifth;
    console.log('Worst team position:', position, 'Points:', points);
  }
  
  console.log('Total worst team points:', points);
  return points;
}

// Main function to calculate total user score
export function calculateUserScore(userPicks, actualResults) {
  if (!userPicks || !actualResults) return 0;
  
  let totalScore = 0;
  
  // Champion
  if (userPicks.nbaChampion === actualResults.champion) {
    totalScore += SCORING_WEIGHTS.champion;
  }
  
  // Add points from each category
  totalScore += calculatePlayoffPoints(userPicks, actualResults);
  totalScore += calculateConferenceFinalsPoints(userPicks, actualResults);
  totalScore += calculateIndividualAwardsPoints(userPicks, actualResults);
  totalScore += calculateAllNBAPoints(userPicks, actualResults);
  totalScore += calculateMidSeasonCupPoints(userPicks, actualResults);
  
  // Calculate spun player points
  const spunPlayerPoints = calculateSpunPlayerPoints(userPicks, actualResults);
  totalScore += spunPlayerPoints;
  
  totalScore += calculateWorstTeamPoints(userPicks, actualResults);
  
  return totalScore;
}

// Function to parse the actual results text file
export function parseActualResults(text) {
  console.log('Starting to parse actual results...');
  console.log('Raw text:', text);
  
  const lines = text.split('\n');
  console.log('Split into lines:', lines);
  
  const results = {
    eastPlayoffTeams: [],
    westPlayoffTeams: [],
    champion: '',
    eastFinals: [],
    westFinals: [],
    mvp: [],
    dpoy: [],
    roy: [],
    mip: [],
    smoy: [],
    coty: [],
    allNbaFirst: [],
    allNbaSecond: [],
    allNbaThird: [],
    worstTeam: [],
    midSeasonCupChampion: [],
    playerPPG: {}
  };

  let currentSection = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    console.log('Processing line:', { original: line, trimmed: trimmedLine, currentSection });
    
    if (!trimmedLine) {
      console.log('Skipping empty line');
      continue;
    }

    if (trimmedLine.startsWith('#')) {
      // Extract the section name exactly as it appears in the file
      currentSection = trimmedLine.substring(1).trim();
      console.log('Found new section:', currentSection);
      continue;
    }

    // Skip empty lines
    if (!trimmedLine) {
      console.log('Skipping empty trimmed line');
      continue;
    }

    switch (currentSection) {
      case 'East Playoff Teams':
        console.log('Adding to eastPlayoffTeams:', trimmedLine);
        results.eastPlayoffTeams.push(trimmedLine);
        break;
      case 'West Playoff Teams':
        console.log('Adding to westPlayoffTeams:', trimmedLine);
        results.westPlayoffTeams.push(trimmedLine);
        break;
      case 'Champion':
        console.log('Setting champion:', trimmedLine);
        results.champion = trimmedLine;
        break;
      case 'East Finals':
        console.log('Adding to eastFinals:', trimmedLine);
        results.eastFinals.push(trimmedLine);
        break;
      case 'West Finals':
        console.log('Adding to westFinals:', trimmedLine);
        results.westFinals.push(trimmedLine);
        break;
      case 'MVP':
        console.log('Adding to mvp:', trimmedLine);
        results.mvp.push(trimmedLine);
        break;
      case 'DPOY':
        console.log('Adding to dpoy:', trimmedLine);
        results.dpoy.push(trimmedLine);
        break;
      case 'ROY':
        console.log('Adding to roy:', trimmedLine);
        results.roy.push(trimmedLine);
        break;
      case 'MIP':
        console.log('Adding to mip:', trimmedLine);
        results.mip.push(trimmedLine);
        break;
      case 'SMOY':
        console.log('Adding to smoy:', trimmedLine);
        results.smoy.push(trimmedLine);
        break;
      case 'COTY':
        console.log('Adding to coty:', trimmedLine);
        results.coty.push(trimmedLine);
        break;
      case 'All-NBA First Team':
        console.log('Adding to allNbaFirst:', trimmedLine);
        results.allNbaFirst.push(trimmedLine);
        break;
      case 'All-NBA Second Team':
        console.log('Adding to allNbaSecond:', trimmedLine);
        results.allNbaSecond.push(trimmedLine);
        break;
      case 'All-NBA Third Team':
        console.log('Adding to allNbaThird:', trimmedLine);
        results.allNbaThird.push(trimmedLine);
        break;
      case 'Worst Team':
        console.log('Adding to worstTeam:', trimmedLine);
        results.worstTeam.push(trimmedLine);
        break;
      case 'Mid-Season Cup Champion':
        console.log('Adding to midSeasonCupChampion:', trimmedLine);
        results.midSeasonCupChampion.push(trimmedLine);
        break;
      case 'Player PPG':
        const [playerName, ppg] = trimmedLine.split(':').map(s => s.trim());
        if (playerName && ppg) {
          console.log('Adding to playerPPG:', { playerName, ppg });
          results.playerPPG[playerName] = parseFloat(ppg);
        }
        break;
      default:
        console.log('No matching section for:', currentSection);
    }
  }

  console.log('Final parsed results:', results);
  return results;
} 