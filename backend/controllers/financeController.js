const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Transaction = require("../models/Transaction");

// --- COLLECT FEE ---
exports.collectFee = async (req, res) => {
  try {
    const { studentId, amount, description } = req.body;
    
    // 1. Update Student Balance
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.feesPaid = (student.feesPaid || 0) + Number(amount);
    await student.save();

    // 2. Create Transaction Record
    await Transaction.create({
      type: "Income",
      category: "Fee",
      amount,
      description: description || `Fees collected from ${student.name}`,
      student: studentId,
      school: req.user.school
    });

    res.json({ message: "Fee collected successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error collecting fee" });
  }
};

// --- PAY SALARY ---
exports.paySalary = async (req, res) => {
  try {
    const { teacherId, amount, month } = req.body;

    // 1. Update Teacher History
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    teacher.salaryHistory.push({
      amount,
      month,
      date: new Date()
    });
    await teacher.save();

    // 2. Create Transaction Record
    await Transaction.create({
      type: "Expense",
      category: "Salary",
      amount,
      description: `Salary paid to ${teacher.name} for ${month}`,
      teacher: teacherId,
      school: req.user.school
    });

    res.json({ message: "Salary paid successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error paying salary" });
  }
};

// --- GET RECENT TRANSACTIONS ---
exports.getTransactions = async (req, res) => {
  try {
    const history = await Transaction.find({ school: req.user.school })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("student", "name rollNo")
      .populate("teacher", "name");
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
};