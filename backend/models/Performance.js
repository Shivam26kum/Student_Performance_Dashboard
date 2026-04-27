const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    examName: {
      type: String,
      required: true, // e.g., "Unit Test 1"
    },
    subject: {
      type: String,
      required: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      default: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    class: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School", // Assuming you have a School model
    },
  },
  { timestamps: true }
);

// Ensure a student only has ONE record per specific exam and subject
performanceSchema.index({ student: 1, examName: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model("Performance", performanceSchema);