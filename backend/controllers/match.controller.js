const MatchService = require("../services/match.service");
const { Cache } = require("../models/cache.model");
const { RedisCache } = require("../utils/redis");
const Logger = require("../utils/logger");

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
      const cacheKey = "matchData";
      
      // Try Redis cache first (much faster)
      let cachedData = await RedisCache.get(cacheKey);
      
      // Fallback to MongoDB cache if Redis fails
      if (!cachedData) {
        const cache = await Cache.findOne({ key: cacheKey }).lean();
        cachedData = cache?.data;
      }
      
      if (cachedData && Array.isArray(cachedData)) {
        // Filter out past matches as a safety measure
        const now = new Date();
        const filteredData = cachedData.filter((match) => {
          if (!match.time) return false;
          const kickOffTime = new Date(match.time);
          return kickOffTime >= now;
        });
        
        // Set optimized cache headers (5 seconds for client-side caching)
        res.set({
          'Cache-Control': 'public, max-age=5, must-revalidate',
          'ETag': `"${Date.now()}"`, // Simple ETag for cache validation
          'Vary': 'Accept-Encoding'
        });
        
        res.json(filteredData);
      } else {
        Logger.debug("No cache found or cache data is empty");
        // Set cache headers
        res.set({
          'Cache-Control': 'no-cache, must-revalidate',
        });
        res.json([]);
      }
    } catch (error) {
      Logger.error("Error fetching match data:", error.message);
      Logger.error("Full error:", error);
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
      // Set cache headers for match results (30 seconds)
      res.set({
        'Cache-Control': 'public, max-age=30, must-revalidate',
        'ETag': `"${id}-${Date.now()}"`,
      });
      res.json(resultData);
    } catch (error) {
      Logger.error(`Error fetching match result for ID ${id}:`, error.message);
      Logger.error(error);
      res.status(500).json({ 
        error: "Error fetching match result",
        id,
        details: error.message 
      });
    }
  }
}

module.exports = MatchController;
