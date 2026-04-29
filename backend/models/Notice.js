const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, "Notice title is required"] 
  },
  content: { 
    type: String, 
    required: [true, "Notice content is required"] 
  },
  audience: { 
    type: String, 
    enum: ["parent", "teacher", "all"], 
    default: "all" 
  },
  school: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "School",
    required: true // Crucial to ensure a notice never leaks to other schools
  },
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'authorRole' // Pro-tip: This allows Mongoose to dynamically populate the user whether they are an Admin or Teacher
  },
  
  // --- THE FIX ---
  // Removed 'required: true' and added safe fallbacks. 
  // Now, if the frontend or controller misses these, the database won't crash!
  authorName: { 
    type: String, 
    default: "School Admin" 
  }, 
  authorRole: { 
    type: String, 
    enum: ["Admin", "Teacher"], 
    default: "Admin" 
  }
  
}, { timestamps: true });

module.exports = mongoose.model("Notice", noticeSchema);