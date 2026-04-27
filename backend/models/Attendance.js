const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["Present", "Absent", "Holiday", "Weekend"], default: "Absent" },
  subject: { type: String, required: true } 
}, { timestamps: true });

// Ensure a student can only have one record per subject per day
attendanceSchema.index({ student: 1, date: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);