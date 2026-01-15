const { getHKMatches } = require("../getAPIFixtureId.js");
const { cachedHandleResult } = require("../data/cached-handleresult");
const { Match } = require("../models/match.model");
const { Cache } = require("../models/cache.model");
const { handleResult } = require("../handleResult.js");
const { RedisCache } = require("../utils/redis");
const Logger = require("../utils/logger");

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
    Logger.time("getMatchData");

    Logger.time("getHKMatches");
    const matches = await getHKMatches();
    Logger.timeEnd("getHKMatches");

    // Optimized: Batch query instead of individual queries
    Logger.time("cacheCheckBatch");
    const matchIds = matches.map(m => m.frontEndId);
    const now = new Date();
    
    // Single batch query with $in operator - much faster than N queries
    const cachedMatchesArray = await Match.find({
      id: { $in: matchIds },
      "cachedData.expiresAt": { $gt: now },
    }).select("id cachedData").lean();
    
    // Create a Map for O(1) lookup
    const cachedMatchesMap = new Map(
      cachedMatchesArray.map(m => [m.id, m])
    );
    
    Logger.timeEnd("cacheCheckBatch");

    Logger.time("matchDatasProcessing");
    const matchDatas = await Promise.all(matches.map(async (match) => {
      const cachedMatch = cachedMatchesMap.get(match.frontEndId);
      
      if (cachedMatch?.cachedData) {
        // Return cached data immediately
        return {
          time: match.kickOffTime,
          id: match.frontEndId,
          homeTeamName: match.homeTeam.name_ch,
          awayTeamName: match.awayTeam.name_ch,
          homeWinRate: cachedMatch.cachedData.homeWinRate,
          awayWinRate: cachedMatch.cachedData.awayWinRate,
        };
      }

      try {
        const resultData = await cachedHandleResult(match.frontEndId);
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

        return {
          time: match.kickOffTime,
          id: match.frontEndId,
          homeTeamName: match.homeTeam.name_ch,
          awayTeamName: match.awayTeam.name_ch,
          homeWinRate: resultData.homeWinRate,
          awayWinRate: resultData.awayWinRate,
        };
      } catch (error) {
        Logger.error(`Error processing match ${match.frontEndId}:`, error);
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
    Logger.timeEnd("matchDatasProcessing");

    // Filter out past matches (matches where kickOffTime has passed)
    // Reuse the now variable from earlier in the function (or get current time if needed)
    const currentTime = new Date();
    const filteredMatchDatas = matchDatas.filter((match) => {
      if (!match.time) return false;
      const kickOffTime = new Date(match.time);
      return kickOffTime >= currentTime;
    });

    Logger.timeEnd("getMatchData");
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
    const resultData = await handleResult(id);
    let match = await Match.findOne({ id: id }).lean();

    if (!match) {
      Logger.debug("Creating new match:", id);
      match = new Match({
        id: id,
        time: new Date(),
        ...resultData,
      });
      await match.save();
    } else {
      // Update existing match data asynchronously (fire and forget)
      Match.findOneAndUpdate(
        { id },
        {
          ...resultData,
          time: resultData.time ?? match.time ?? new Date(),
        },
        { upsert: true, new: true }
      ).catch(err => Logger.error(`Error updating match ${id}:`, err));
    }

    return resultData;
  }
}

module.exports = MatchService;
