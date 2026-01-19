const axios = require("axios");
const { processTeams } = require("../getAPIFixtureId"); // Adjust the path as needed
async function getPredictions(id) {
  try {
    const matchedTeam = await processTeams(id);
    const options = {
      method: "GET",
      url: "https://v3.football.api-sports.io/odds", // Corrected URL
      params: { fixture: matchedTeam.fixtureId }, // Use params to pass query parameters
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": "43984110ca9979e5fbc3d812d6808265",
      },
    };

    const response = await axios.request(options);
    const data = response.data;

    // Check if response data exists and has the expected structure
    if (data.response && data.response[0] && data.response[0].bookmakers) {
      const bet365Bookmarker = data.response[0].bookmakers.find(bookmaker => bookmaker.id === 8);
      if (bet365Bookmarker && bet365Bookmarker.bets) {
        const odds = bet365Bookmarker.bets.find(bet => bet.name === "Home/Away");
        if (odds && odds.values) {
          const homeOdd = odds.values.find(value => value.value === "Home");
          const awayOdd = odds.values.find(value => value.value === "Away");
          if (homeOdd && awayOdd) {
            return {
              homeOdds: homeOdd.odd,
              awayOdds: awayOdd.odd
            };
          }
        }
      }
    }
    console.log(`[PREDICTIONS] No odds found for match ${id}`);
    return null;
  } catch (error) {
    console.error(`[PREDICTIONS] Error fetching predictions for match ${id}:`, error.message);
    return null;
  }
}
module.exports = { getPredictions };

