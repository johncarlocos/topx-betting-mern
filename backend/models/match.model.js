const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * @typedef {object} Match
 * @property {string} id - The unique identifier for the match.
 * @property {Date} time - The scheduled time of the match.
 * @property {string} homeTeamName - The name of the home team.
 * @property {string} awayTeamName - The name of the away team.
 * @property {string} [homeTeamLogo] - The URL of the home team's logo.
 * @property {string} [awayTeamLogo] - The URL of the away team's logo.
 * @property {string} [homeWinRate] - The win rate of the home team.
 * @property {string} [awayWinRate] - The win rate of the away team.
 * @property {number} [overRound] - The overround value.
 * @property {number} [evHome] - The expected value for the home team.
 * @property {number} [evAway] - The expected value for the away team.
 * @property {number} [pbrHome] - The profit-to-bet ratio for the home team.
 * @property {number} [pbrAway] - The profit-to-bet ratio for the away team.
 * @property {number} [kellyHome] - The Kelly criterion value for the home team.
 * @property {number} [kellyAway] - The Kelly criterion value for the away team.
 * @property {mongoose.Schema.Types.ObjectId} createdBy - The ID of the admin who created the match.
 */
const MatchSchema = new Schema({
  id: { type: String, required: true, unique: true },
  time: { type: Date, required: true },
  homeTeamName: { type: String, required: true },
  awayTeamName: { type: String, required: true },
  homeTeamLogo: { type: String },
  awayTeamLogo: { type: String },
  homeWinRate: { type: String },
  awayWinRate: { type: String },
  overRound: { type: Number },
  evHome: { type: Number },
  evAway: { type: Number },
  pbrHome: { type: Number },
  pbrAway: { type: Number },
  kellyHome: { type: Number },
  kellyAway: { type: Number },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
});

/**
 * @class MatchModel
 * @classdesc Represents the Match model.
 */
class MatchModel {
  /**
   * Finds a match by its ID.
   * @param {string} id - The ID of the match to find.
   * @returns {Promise<Match|null>} - The found match or null if not found.
   * @static
   * @async
   */
  static async findById(id) {
    return await Match.findOne({ id: id });
  }
}

const Match = mongoose.model("Match", MatchSchema);

// Add TTL index for cached data
MatchSchema.index({ 'cachedData.expiresAt': 1 }, { expireAfterSeconds: 0 });
// Index on id for faster lookups (already unique, but explicit is good)
MatchSchema.index({ id: 1 });
// Index on time for filtering by date
MatchSchema.index({ time: 1 });
// Compound index for cache lookups
MatchSchema.index({ id: 1, 'cachedData.expiresAt': 1 });

module.exports = { Match, MatchModel };
