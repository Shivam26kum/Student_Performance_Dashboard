const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  teacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teacher', 
    required: true 
  },
  school: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'School', 
    required: true 
  },
  // The 'day' ensures that Monday's routine is independent of Tuesday's
  day: { 
    type: String, 
    required: true,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] 
  },
  startTime: { 
    type: String, 
    required: true // Format: "HH:mm" (e.g., "09:00")
  },
  endTime: { 
    type: String, 
    required: true // Format: "HH:mm" (e.g., "10:00")
  },
  subject: { 
    type: String, 
    required: true,
    trim: true 
  },
  classGrade: { 
    type: String, 
    required: true 
  },
  section: { 
    type: String,
    default: "" 
  },
  room: { 
    type: String,
    trim: true 
  }
}, { 
  timestamps: true 
});

/**
 * DATABASE-LEVEL SAFETY NETS (INDEXES)
 */

// 1. Prevent Teacher Double-Booking:
// A teacher cannot be in two places at the exact same start time on the same day.
scheduleSchema.index({ school: 1, day: 1, teacher: 1, startTime: 1 }, { unique: true });

// 2. Prevent Class Overlap:
// A specific Class/Section cannot have two different subjects at the same start time on the same day.
scheduleSchema.index({ school: 1, day: 1, classGrade: 1, section: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model("Schedule", scheduleSchema);