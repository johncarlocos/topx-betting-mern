const { MatchRecord } = require("../models/matchRecord.model");
const Logger = require("../utils/logger");

/**
 * @class MatchRecordService
 * @classdesc Service for match record-related operations.
 */
class MatchRecordService {
  /**
   * Creates a new match record.
   * @param {object} recordData - The match record data.
   * @param {Date} recordData.date - The date of the record.
   * @param {string} recordData.text - The text content.
   * @param {string} [recordData.mediaUrl] - The media file URL.
   * @param {string} [recordData.mediaType] - The media type ('image' or 'video').
   * @param {mongoose.Types.ObjectId} recordData.createdBy - The admin ID who created it.
   * @returns {Promise<MatchRecord>}
   * @static
   * @async
   */
  static async createRecord(recordData) {
    try {
      const record = new MatchRecord(recordData);
      await record.save();
      Logger.info(`Match record created: ${record._id}`);
      return record;
    } catch (error) {
      Logger.error("Error creating match record:", error);
      throw error;
    }
  }

  /**
   * Gets all match records, sorted by date (newest first).
   * @returns {Promise<MatchRecord[]>}
   * @static
   * @async
   */
  static async getAllRecords() {
    try {
      const records = await MatchRecord.find()
        .populate("createdBy", "username")
        .sort({ date: -1, createdAt: -1 });
      return records;
    } catch (error) {
      Logger.error("Error fetching match records:", error);
      throw error;
    }
  }

  /**
   * Gets a match record by ID.
   * @param {string} id - The record ID.
   * @returns {Promise<MatchRecord|null>}
   * @static
   * @async
   */
  static async getRecordById(id) {
    try {
      const record = await MatchRecord.findById(id).populate(
        "createdBy",
        "username"
      );
      return record;
    } catch (error) {
      Logger.error("Error fetching match record by ID:", error);
      throw error;
    }
  }

  /**
   * Updates a match record.
   * @param {string} id - The record ID.
   * @param {object} updateData - The data to update.
   * @returns {Promise<MatchRecord|null>}
   * @static
   * @async
   */
  static async updateRecord(id, updateData) {
    try {
      const record = await MatchRecord.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate("createdBy", "username");
      if (record) {
        Logger.info(`Match record updated: ${id}`);
      }
      return record;
    } catch (error) {
      Logger.error("Error updating match record:", error);
      throw error;
    }
  }

  /**
   * Deletes a match record.
   * @param {string} id - The record ID.
   * @returns {Promise<boolean>}
   * @static
   * @async
   */
  static async deleteRecord(id) {
    try {
      const result = await MatchRecord.findByIdAndDelete(id);
      if (result) {
        Logger.info(`Match record deleted: ${id}`);
        return true;
      }
      return false;
    } catch (error) {
      Logger.error("Error deleting match record:", error);
      throw error;
    }
  }
}

module.exports = MatchRecordService;

