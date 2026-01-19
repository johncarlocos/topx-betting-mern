const { getPredictions } = require("./data/api-predictions.js");
const { getHKMatches } = require("./getAPIFixtureId.js");
const { getLogo } = require("./data/api-logo.js");

async function handleResult(id) {
  try {
    // Try to get predictions and logos (these can fail without breaking everything)
    const winRate = await getPredictions(id).catch(err => {
      console.log(`[PREDICTIONS] Could not fetch predictions for ${id}:`, err.message);
      return null;
    });
    const teamLogo = await getLogo(id).catch(err => {
      console.log(`[LOGO] Could not fetch logo for ${id}:`, err.message);
      return { homeLogo: "", awayLogo: "" };
    });

    const matches = await getHKMatches();
    // console.log("[MATCHES] CACHED MATCHES", matches);
    const hkTeam = matches.find((match) => match.frontEndId === id);
    console.log("[MATCHES] HK TEAM", hkTeam);
    
    if (!hkTeam) {
      throw new Error(`Match not found for id: ${id}`);
    }
    
    const homeTeamName = hkTeam.homeTeam.name_ch;
    const awayTeamName = hkTeam.awayTeam.name_ch;
    
    let homeOdd;
    let awayOdd;
    if (winRate?.homeOdds) {
      homeOdd = winRate.homeOdds;
      awayOdd = winRate.awayOdds;
    } else {
      // Try to find odds in foPools (HAD pool - Home/Away/Draw)
      if (hkTeam && hkTeam.foPools && hkTeam.foPools.length > 0) {
        // Look for HAD pool first
        const hadPool = hkTeam.foPools.find(pool => pool.oddsType === "HAD");
        if (hadPool && hadPool.lines && hadPool.lines[0]) {
          const combinations = hadPool.lines[0].combinations || [];
          if (combinations[0]) {
            // HAD pool has 3 combinations: Home, Draw, Away
            // We only need Home and Away (skip Draw at index 1)
            homeOdd = combinations[0].currentOdds;
            awayOdd = combinations[2]?.currentOdds; // Away is at index 2
          }
        }
        
        // If still no odds, try first pool
        if ((!homeOdd || !awayOdd) && hkTeam.foPools[0]) {
          const combinations = hkTeam.foPools[0].lines?.[0]?.combinations || [];
          if (combinations[0]) {
            homeOdd = combinations[0].currentOdds || homeOdd;
            awayOdd = combinations[1]?.currentOdds || awayOdd; // If combinations[1] exists
          }
        }
      }
    }
    
    // Validate that odds are available before calculating win rates
    if (!homeOdd || !awayOdd || isNaN(homeOdd) || isNaN(awayOdd)) {
      console.error(`[MATCHES] Missing or invalid odds for match ${id}`, { 
        homeOdd, 
        awayOdd, 
        hasFoPools: hkTeam?.foPools?.length > 0,
        poolTypes: hkTeam?.foPools?.map(p => p.oddsType) 
      });
      
      // Return partial result with team names and logos (but no win rates)
      // This allows the match to be displayed even without odds
      return {
        homeTeamName,
        homeTeamLogo: teamLogo?.homeLogo || "",
        awayTeamName,
        awayTeamLogo: teamLogo?.awayLogo || "",
        homeWinRate: null,
        awayWinRate: null,
        overRound: null,
        evHome: null,
        evAway: null,
        pbrHome: null,
        pbrAway: null,
        kellyHome: null,
        kellyAway: null,
      };
    }

    // Calculate win rates since odds are available
    const homeWinProb = parseFloat((100 / homeOdd).toFixed(1));
    const awayWinProb = parseFloat((100 / awayOdd).toFixed(1));

    const homeWinRate = homeWinProb * 100 / (homeWinProb + awayWinProb);
    const awayWinRate = awayWinProb * 100 / (homeWinProb + awayWinProb);

    const overRound = parseFloat((homeWinProb + awayWinProb - 100).toFixed(1));

    const bet_funds = 100;
    const evHome = parseFloat(
      ((homeWinProb / 100) * homeOdd * bet_funds -
        (awayWinProb / 100) * bet_funds).toFixed(2),
    );
    const evAway = parseFloat(
      ((awayWinProb / 100) * awayOdd * bet_funds -
        (homeWinProb / 100) * bet_funds).toFixed(2),
    );

    const pbrHome = parseFloat((homeOdd / homeWinProb).toFixed(2));
    const pbrAway = parseFloat((awayOdd / awayWinProb).toFixed(2));

    const kellyHome = parseFloat(
      ((homeWinProb * (homeOdd - 1) - (1 - homeWinProb)) / (homeOdd - 1))
        .toFixed(
          2,
        ),
    );
    const kellyAway = parseFloat(
      ((awayWinProb * (awayOdd - 1) - (1 - awayWinProb)) / (awayOdd - 1))
        .toFixed(
          2,
        ),
    );

    const homeTeamLogo = teamLogo?.homeLogo ? teamLogo.homeLogo : "";
    const awayTeamLogo = teamLogo?.awayLogo ? teamLogo.awayLogo : "";

    const matchResult = {
      homeTeamName,
      homeTeamLogo,
      awayTeamName,
      awayTeamLogo,
      homeWinRate: parseFloat(homeWinRate),
      awayWinRate: parseFloat(awayWinRate),
      overRound,
      evHome,
      evAway,
      pbrHome,
      pbrAway,
      kellyHome,
      kellyAway,
    };
    console.log("[MATCHES] MATCH RESULT", matchResult);
    console.log(matchResult);
    return matchResult;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// handleResult("FB6264");
module.exports = { handleResult };
