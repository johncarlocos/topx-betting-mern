const MatchRecordService = require("../services/matchRecord.service");
const Logger = require("../utils/logger");
const fs = require("fs");
const path = require("path");

/**
 * @class MatchRecordController
 * @classdesc Controller for match record-related operations.
 */
class MatchRecordController {
  /**
   * Creates a new match record.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async createRecord(req, res) {
    try {
      const { date, text } = req.body;
      const file = req.file;
      const adminId = req.admin._id; // From auth middleware

      if (!date || !text) {
        return res.status(400).json({
          message: "Date and text are required",
        });
      }

      let mediaUrl = null;
      let mediaType = null;

      // Handle file upload if present
      if (file) {
        try {
          // Create uploads directory in backend folder if it doesn't exist
          const uploadsDir = path.join(__dirname, "../uploads");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
            Logger.info(`Created uploads directory: ${uploadsDir}`);
          }

          // Generate unique filename
          const fileExt = path.extname(file.originalname);
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;
          const filePath = path.join(uploadsDir, fileName);

          // Verify file buffer exists
          if (!file.buffer) {
            Logger.error("File buffer is empty");
            return res.status(400).json({
              message: "File upload failed: empty file buffer",
            });
          }

          // Write file to disk
          fs.writeFileSync(filePath, file.buffer);
          Logger.info(`File saved successfully: ${filePath}, size: ${file.buffer.length} bytes`);

          // Verify file was written
          if (!fs.existsSync(filePath)) {
            Logger.error(`File was not written: ${filePath}`);
            return res.status(500).json({
              message: "File upload failed: file was not saved",
            });
          }

          // Store URL path for accessing the file (served by backend)
          mediaUrl = `/api/uploads/${fileName}`;
          mediaType = file.mimetype.startsWith("image/") ? "image" : "video";
          Logger.info(`File uploaded: ${mediaUrl}, type: ${mediaType}`);
        } catch (fileError) {
          Logger.error("Error handling file upload:", fileError);
          return res.status(500).json({
            message: "Failed to save uploaded file",
            error: fileError.message,
          });
        }
      }

      const recordData = {
        date: new Date(date),
        text,
        mediaUrl,
        mediaType,
        createdBy: adminId,
      };

      const record = await MatchRecordService.createRecord(recordData);
      res.status(201).json({
        message: "Match record created successfully",
        record,
      });
    } catch (error) {
      Logger.error("Error creating match record:", error);
      res.status(500).json({
        message: "Failed to create match record",
        error: error.message,
      });
    }
  }

  /**
   * Gets all match records.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async getAllRecords(req, res) {
    try {
      const records = await MatchRecordService.getAllRecords();
      res.status(200).json({
        message: "Match records retrieved successfully",
        records,
      });
    } catch (error) {
      Logger.error("Error fetching match records:", error);
      res.status(500).json({
        message: "Failed to fetch match records",
        error: error.message,
      });
    }
  }

  /**
   * Gets a match record by ID.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async getRecordById(req, res) {
    try {
      const { id } = req.params;
      const record = await MatchRecordService.getRecordById(id);

      if (!record) {
        return res.status(404).json({
          message: "Match record not found",
        });
      }

      res.status(200).json({
        message: "Match record retrieved successfully",
        record,
      });
    } catch (error) {
      Logger.error("Error fetching match record:", error);
      res.status(500).json({
        message: "Failed to fetch match record",
        error: error.message,
      });
    }
  }

  /**
   * Updates a match record.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async updateRecord(req, res) {
    try {
      const { id } = req.params;
      const { date, text } = req.body;
      const file = req.file;

      const updateData = {};

      if (date) updateData.date = new Date(date);
      if (text !== undefined) updateData.text = text;

      // Handle file upload if present
      if (file) {
        try {
          // Get existing record to delete old file
          const existingRecord = await MatchRecordService.getRecordById(id);
          if (existingRecord && existingRecord.mediaUrl) {
            // Extract filename from URL (format: /api/uploads/filename)
            const oldFileName = existingRecord.mediaUrl.replace("/api/uploads/", "");
            const oldFilePath = path.join(__dirname, "../uploads", oldFileName);
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
              Logger.info(`Deleted old file: ${oldFilePath}`);
            }
          }

          // Create uploads directory in backend folder if it doesn't exist
          const uploadsDir = path.join(__dirname, "../uploads");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
            Logger.info(`Created uploads directory: ${uploadsDir}`);
          }

          // Generate unique filename
          const fileExt = path.extname(file.originalname);
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;
          const filePath = path.join(uploadsDir, fileName);

          // Verify file buffer exists
          if (!file.buffer) {
            Logger.error("File buffer is empty");
            return res.status(400).json({
              message: "File upload failed: empty file buffer",
            });
          }

          // Write file to disk
          fs.writeFileSync(filePath, file.buffer);
          Logger.info(`File saved successfully: ${filePath}, size: ${file.buffer.length} bytes`);

          // Verify file was written
          if (!fs.existsSync(filePath)) {
            Logger.error(`File was not written: ${filePath}`);
            return res.status(500).json({
              message: "File upload failed: file was not saved",
            });
          }

          updateData.mediaUrl = `/api/uploads/${fileName}`;
          updateData.mediaType = file.mimetype.startsWith("image/") ? "image" : "video";
          Logger.info(`File uploaded: ${updateData.mediaUrl}, type: ${updateData.mediaType}`);
        } catch (fileError) {
          Logger.error("Error handling file upload:", fileError);
          return res.status(500).json({
            message: "Failed to save uploaded file",
            error: fileError.message,
          });
        }
      }

      const record = await MatchRecordService.updateRecord(id, updateData);

      if (!record) {
        return res.status(404).json({
          message: "Match record not found",
        });
      }

      res.status(200).json({
        message: "Match record updated successfully",
        record,
      });
    } catch (error) {
      Logger.error("Error updating match record:", error);
      res.status(500).json({
        message: "Failed to update match record",
        error: error.message,
      });
    }
  }

  /**
   * Deletes a match record.
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @returns {Promise<void>}
   * @static
   * @async
   */
  static async deleteRecord(req, res) {
    try {
      const { id } = req.params;

      // Get record to delete associated file
      const record = await MatchRecordService.getRecordById(id);
      if (record && record.mediaUrl) {
        // Extract filename from URL (format: /api/uploads/filename)
        const fileName = record.mediaUrl.replace("/api/uploads/", "");
        const filePath = path.join(__dirname, "../uploads", fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          Logger.info(`Deleted file: ${filePath}`);
        }
      }

      const deleted = await MatchRecordService.deleteRecord(id);

      if (!deleted) {
        return res.status(404).json({
          message: "Match record not found",
        });
      }

      res.status(200).json({
        message: "Match record deleted successfully",
      });
    } catch (error) {
      Logger.error("Error deleting match record:", error);
      res.status(500).json({
        message: "Failed to delete match record",
        error: error.message,
      });
    }
  }
}

module.exports = MatchRecordController;

