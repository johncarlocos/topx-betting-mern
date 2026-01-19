
const axios = require("axios");
const { processTeams } = require("../getAPIFixtureId"); // Adjust the path as needed
async function getLogo(id) {
  try {
    const matchedTeam = await processTeams(id);
    const options = {
      method: "GET",
      url: "https://v3.football.api-sports.io/predictions", // Corrected URL
      params: { fixture: matchedTeam.fixtureId }, // Use params to pass query parameters
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": "43984110ca9979e5fbc3d812d6808265",
      },
    };

    const response = await axios.request(options);
    const data = response.data;

    // Check if response data exists and has the expected structure
    if (data.response && data.response[0] && data.response[0].teams) {
      const homeTeamLogo = data.response[0].teams?.home?.logo || "";
      const awayTeamLogo = data.response[0].teams?.away?.logo || "";
      return {
        homeLogo: homeTeamLogo,
        awayLogo: awayTeamLogo,
      };
    } else {
      console.log(`[LOGO] No logo data found for match ${id}`);
      return {
        homeLogo: "",
        awayLogo: "",
      };
    }
  } catch (error) {
    console.error(`[LOGO] Error fetching logo for match ${id}:`, error.message);
    // Return empty logos instead of failing
    return {
      homeLogo: "",
      awayLogo: "",
    };
  }
}

module.exports = { getLogo };

