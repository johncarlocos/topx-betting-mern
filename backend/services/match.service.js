const { getHKMatches } = require("../getAPIFixtureId.js");
const { cachedHandleResult } = require("../data/cached-handleresult");
const { Match } = require("../models/match.model");
const { Cache } = require("../models/cache.model");
const { handleResult } = require("../handleResult.js");

/**
 * @class MatchService
 * @classdesc Service class for handling match-related operations.
 */
class MatchService {
  /**
   * Fetches match data and caches it.
   * @returns {Promise<Array<object>>} - An array of match data.
   * @static
   * @async
   */
  static async getMatchData() {
    console.time("getMatchData"); // Start timing 전체 getMatchData 함수

    console.time("getHKMatches"); // Start timing getHKMatches call
    const matches = await getHKMatches();
    console.timeEnd("getHKMatches"); // End timing getHKMatches call

    console.time("cacheCheckPromises"); // Start timing cache check promises
    const cacheCheckPromises = matches.map((match) =>
      Match.findOne({
        id: match.frontEndId,
        "cachedData.expiresAt": { $gt: new Date() },
      })
    );
    const cachedMatches = await Promise.all(cacheCheckPromises);
    console.timeEnd("cacheCheckPromises"); // End timing cache check promises

    console.time("matchDatasProcessing"); // Start timing match data processing
    const matchDatas = await Promise.all(matches.map(async (match, index) => {
      console.time(`processMatch-${match.frontEndId}`); // Start timing individual match processing
      if (cachedMatches[index]?.cachedData) {
        console.timeEnd(`processMatch-${match.frontEndId}`); // End timing individual match processing (cached)
        // ... cached data handling ...
        return {
          time: match.kickOffTime,
          id: match.frontEndId,
          homeTeamName: match.homeTeam.name_ch,
          awayTeamName: match.awayTeam.name_ch,
          homeWinRate: cachedMatches[index].cachedData.homeWinRate,
          awayWinRate: cachedMatches[index].cachedData.awayWinRate,
        };
      }

      try {
        console.time(`cachedHandleResult-${match.frontEndId}`); // Start timing cachedHandleResult
        const resultData = await cachedHandleResult(match.frontEndId);
        console.timeEnd(`cachedHandleResult-${match.frontEndId}`); // End timing cachedHandleResult
        // await Match.findOneAndUpdate(
        //   { id: match.frontEndId },
        //   {
        //     $set: {
        //       cachedData: {
        //         homeWinRate: resultData.homeWinRate,
        //         awayWinRate: resultData.awayWinRate,
        //         expiresAt: new Date(Date.now() + 3600000) // 1 hour
        //       }
        //     }
        //   },
        //   { upsert: true, new: true }
        // );

        console.timeEnd(`processMatch-${match.frontEndId}`); // End timing individual match processing (uncached)
        return {
          time: match.kickOffTime,
          id: match.frontEndId,
          homeTeamName: match.homeTeam.name_ch,
          awayTeamName: match.awayTeam.name_ch,
          homeWinRate: resultData.homeWinRate,
          awayWinRate: resultData.awayWinRate,
        };
      } catch (error) {
        console.error(`Error processing match ${match.frontEndId}:`, error);
        console.timeEnd(`processMatch-${match.frontEndId}`); // End timing individual match processing (error)
        return {
          time: match.kickOffTime,
          id: match.frontEndId,
          homeTeamName: match.homeTeam.name_ch,
          awayTeamName: match.awayTeam.name_ch,
          homeWinRate: "N/A",
          awayWinRate: "N/A",
        };
      }
    }));
    console.timeEnd("matchDatasProcessing"); // End timing match data processing

    // Filter out past matches (matches where kickOffTime has passed)
    const now = new Date();
    const filteredMatchDatas = matchDatas.filter((match) => {
      if (!match.time) return false;
      const kickOffTime = new Date(match.time);
      return kickOffTime >= now;
    });

    console.timeEnd("getMatchData"); // End timing 전체 getMatchData 함수
    return filteredMatchDatas;
  }

  /**
   * Fetches match result based on ID.
   * @param {string} id - The ID of the match.
   * @returns {Promise<object>} - The match result data.
   * @static
   * @async
   */
  static async getMatchResult(id) {
    const resultData = handleResult(id);
    let match = await Match.findOne({ id: id });

    if (!match) {
      console.log("Creating new match");
      match = new Match({
        id: id,
        time: new Date(), // Placeholder, adjust as needed
        ...(await resultData),
      });
      await match.save();
    } else {
      // Update existing match data
      new Promise(async (resolve, reject) => {
        try {
          console.log("Updating existing match");
          Object.assign(match, {
            ...(await resultData),
            time: resultData.time ?? match.time ?? new Date(),
          });
          await match.save();
          resolve(resultData);
        } catch (error) {
          reject(error);
        }
      });
    }

    return resultData;
  }
}

module.exports = MatchService;
