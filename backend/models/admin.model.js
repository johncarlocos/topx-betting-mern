const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * @typedef {object} Admin
 * @property {string} username - The username of the admin.
 * @property {string} password - The password of the admin.
 * @property {string} role - The role of the admin ('main' or 'sub').
 * @property {Date} createdAt - The date the admin was created.
 */
const AdminSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, required: true, enum: ["main", "sub"] },
  createdAt: { type: Date, default: Date.now },
});

const Admin = mongoose.model("Admin", AdminSchema);

// Create indexes for performance optimization
// Index on role for filtering by role
AdminSchema.index({ role: 1 });
// Index on username for faster lookups (already unique, but explicit is good)
AdminSchema.index({ username: 1 });
// Index on createdAt for sorting
AdminSchema.index({ createdAt: -1 });

module.exports = { Admin };
