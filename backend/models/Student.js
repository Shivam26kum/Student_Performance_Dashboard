const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  rollNo: { 
    type: String, 
    required: true,
    trim: true 
  },
  class: { 
    type: String, 
    required: true,
    trim: true // Added trim here just to be safe!
  },
  section: { 
    type: String, 
    // REMOVED required: true
    default: "", // Defaults to empty string if no section is given
    trim: true 
  },
  teacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Teacher" 
  },
  school: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "School",
    required: true
  },
  parent: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Parent" 
  },
  
  /**
   * MONTHLY FINANCIAL TRACKING
   */
  feesTotal: { 
    type: Number, 
    default: 0 
  }, 
  
  feesPaid: { 
    type: Number, 
    default: 0 
  },

  currentBillingMonth: {
    type: String,
    default: () => new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  },

  appliedPenalty: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

// Index for faster lookups
studentSchema.index({ school: 1, class: 1, section: 1, rollNo: 1 }, { unique: true });

module.exports = mongoose.model("Student", studentSchema);