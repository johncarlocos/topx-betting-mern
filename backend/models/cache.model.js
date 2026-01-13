const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CacheSchema = new Schema({
  key: { type: String, required: true, unique: true },
  data: { type: Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now },
});

const Cache = mongoose.model("Cache", CacheSchema);

module.exports = { Cache };
