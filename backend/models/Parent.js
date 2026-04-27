const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    unique: true, 
    required: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  // Added this field so your Edit Detail form can actually store the data
  phone: { 
    type: String, 
  },
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Student", 
    required: true 
  },
  // Changed ref from "Class" to "School" to match standard naming
  school: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "School", 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model("Parent", parentSchema);