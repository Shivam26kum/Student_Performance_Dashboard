const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  }, // e.g. "Grade 10-A"
  
  school: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "School", 
    required: true 
  },

  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    default: null
  },

  students: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Student" 
  }],

  /**
   * FINANCIAL CONFIGURATION
   * These fields store the policy for the class.
   */
  monthlyFee: { 
    type: Number, 
    default: 0,
    min: 0 
  },

  // ADDED: Transport fee field
  busFee: { 
    type: Number, 
    default: 0,
    min: 0 
  },

  // ADDED: Miscellaneous/Other required fees
  otherFee: { 
    type: Number, 
    default: 0,
    min: 0 
  },

  lateFeePenalty: { 
    type: Number, 
    default: 0,
    min: 0 
  }

}, { timestamps: true });

// Indexing for performance and uniqueness
classSchema.index({ name: 1, school: 1 }, { unique: true });

module.exports = mongoose.model("Class", classSchema);