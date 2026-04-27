const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  address: String,
  email: String,
  phone: String
}, { timestamps: true });

module.exports = mongoose.model("School", schoolSchema);
