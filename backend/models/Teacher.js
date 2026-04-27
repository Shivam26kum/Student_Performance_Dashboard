const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  
  // 👇 CHANGE THIS: Instead of single classGrade/section/subject
  assignedClasses: [
    {
      classGrade: { type: String, required: true },
      section: { type: String, required: true },
      subject: { type: String, required: true }
    }
  ],
  
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School" }
}, { timestamps: true });

module.exports = mongoose.model("Teacher", teacherSchema);