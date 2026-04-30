const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  
  assignedClasses: [
    {
      classGrade: { type: String, required: true, trim: true },
      section: { 
        type: String, 
        // REMOVED required: true
        default: "", // Defaults to empty string
        trim: true 
      },
      subject: { type: String, required: true, trim: true }
    }
  ],
  
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School" }
}, { timestamps: true });

module.exports = mongoose.model("Teacher", teacherSchema);