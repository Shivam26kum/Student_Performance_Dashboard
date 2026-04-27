const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String, required: true }, // URL to the file (Cloudinary/S3/Local)
    type: { type: String, required: true },    // e.g., "PDF", "Image", "Docx"
    classGrade: { type: String, required: true },
    section: { type: String, required: true },
    subject: { type: String, required: true },
    school: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "School", 
      required: true 
    },
    teacher: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Teacher", 
      required: true 
    },
    authorName: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Material", materialSchema);