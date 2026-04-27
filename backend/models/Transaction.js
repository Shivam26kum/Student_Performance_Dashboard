const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["Income", "Expense"], required: true }, // Income = Fee, Expense = Salary
  category: { type: String, enum: ["Fee", "Salary", "Other"], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String }, // e.g., "Fee for Jan", "Salary for John"
  
  // Links
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" }, // If Fee
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }, // If Salary
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);