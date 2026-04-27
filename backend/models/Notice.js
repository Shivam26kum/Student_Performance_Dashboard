const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  audience: { type: String, enum: ["parent", "teacher", "all"], default: "all" },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
  
  // The ID of the person who posted it
  postedBy: { type: mongoose.Schema.Types.ObjectId, required: true }, 
  
  // NEW: Fields to store the Name and Role directly for quick access
  authorName: { type: String, required: true }, 
  authorRole: { type: String, enum: ["Admin", "Teacher"], default: "Teacher" }
  
}, { timestamps: true });

module.exports = mongoose.model("Notice", noticeSchema);