const MatchService = require("../services/match.service");
const { Cache } = require("../models/cache.model");

/**
 * @class MatchController
 * @classdesc Controller class for handling match-related requests.
 */
class MatchController {
  /**
   * Handles request to get match data.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async getMatchData(req, res) {
    try {
      const cache = await Cache.findOne({ key: "matchData" });
      if (cache && cache.data) {
        // Filter out past matches as a safety measure
        const now = new Date();
        const filteredData = cache.data.filter((match) => {
          if (!match.time) return false;
          const kickOffTime = new Date(match.time);
          return kickOffTime >= now;
        });
        // Set cache headers to prevent stale 304 responses
        res.set({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
        res.json(filteredData);
      } else {
        console.log("No cache found or cache data is empty. Cache:", cache ? "exists but no data" : "does not exist");
        // Set cache headers
        res.set({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
        res.json([]);
      }
    } catch (error) {
      console.error("Error fetching match data:", error.message);
      console.error("Full error:", error);
      res.status(500).json({ error: "Error fetching match data", details: error.message });
    }
  }

  /**
   * Handles request to get match result by ID.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async getMatchResult(req, res) {
    const { id } = req.params;
    try {
      const resultData = await MatchService.getMatchResult(id);
      res.json(resultData);
    } catch (error) {
      console.error(`Error fetching match result for ID ${id}:`, error.message);
      console.error(error)
      res.status(500).json({ 
        error: "Error fetching match result",
        id,
        details: error.message 
      });
    }
  }
}

module.exports = MatchController;
