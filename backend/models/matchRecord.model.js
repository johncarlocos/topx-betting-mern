const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * @typedef {object} MatchRecord
 * @property {Date} date - The date of the record.
 * @property {string} text - The text content of the record.
 * @property {string} [mediaUrl] - The URL/path to the uploaded media file (photo or video).
 * @property {string} [mediaType] - The type of media: 'image' or 'video'.
 * @property {mongoose.Schema.Types.ObjectId} createdBy - The ID of the admin who created the record.
 * @property {Date} createdAt - The timestamp when the record was created.
 * @property {Date} updatedAt - The timestamp when the record was last updated.
 */
const MatchRecordSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    mediaUrl: {
      type: String,
      // Keep for backward compatibility
    },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      // Keep for backward compatibility
    },
    media: [
      {
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["image", "video"],
          required: true,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// Index on date for faster filtering and sorting
MatchRecordSchema.index({ date: -1 });
MatchRecordSchema.index({ createdAt: -1 });

const MatchRecord = mongoose.model("MatchRecord", MatchRecordSchema);

module.exports = { MatchRecord };

