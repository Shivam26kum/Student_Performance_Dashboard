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
    required: true 
  },
  section: { 
    type: String, 
    required: true 
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
  }, // This will be: Base Monthly Fee + Late Penalty (if applicable)
  
  feesPaid: { 
    type: Number, 
    default: 0 
  }, // Amount paid for the current billing cycle

  // Tracks which month the current 'feesTotal' belongs to (e.g., "April 2026")
  currentBillingMonth: {
    type: String,
    default: () => new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  },

  // Stores the specific penalty amount applied this month for record-keeping
  appliedPenalty: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

// Index for faster lookups when the Admin searches for students by class/section
studentSchema.index({ school: 1, class: 1, section: 1, rollNo: 1 }, { unique: true });

module.exports = mongoose.model("Student", studentSchema);