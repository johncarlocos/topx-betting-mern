const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * @typedef {object} Member
 * @property {string} username - The username of the member.
 * @property {string} password - The password of the member.
 * @property {Date} createdAt - The date the member was created.
 * @property {number} price - The price associated with the member.
 * @property {boolean} blocked - Whether the member is blocked.
 * @property {string[]} ipAddresses - The IP addresses the member has logged in from.
 * @property {mongoose.Schema.Types.ObjectId} createdBy - The ID of the admin who created the member.
 */
const MemberSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  createdAt: { type: Date, default: Date.now },
  price: { type: Number },
  blocked: { type: Boolean, default: false },
  ipAddresses: [{ type: String }],
  immuneToIPBan: { type: Boolean, default: false },
  date: { type: Date, required: true },
  slug: { type: String, required: true, unique: true, index: true },
    createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
});

const Member = mongoose.model("Member", MemberSchema);

// Create indexes for performance optimization
// Index on createdBy for filtering by admin
MemberSchema.index({ createdBy: 1 });
// Index on blocked for filtering blocked members
MemberSchema.index({ blocked: 1 });
// Index on date for date-based queries
MemberSchema.index({ date: 1 });
// Compound index for common query patterns (createdBy + blocked)
MemberSchema.index({ createdBy: 1, blocked: 1 });
// Index on createdAt for sorting
MemberSchema.index({ createdAt: -1 });

module.exports = { Member };
