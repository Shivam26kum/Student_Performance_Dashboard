const Performance = require("../models/Performance");

/**
 * @desc    Add or Update a single student's performance record
 * @route   POST /api/teacher/performance/add
 */
exports.addPerformance = async (req, res) => {
  try {
    const { studentId, examName, subject, marksObtained, totalMarks, classGrade, section } = req.body;

    // 1. Basic Validation
    if (!studentId || !examName || !subject || marksObtained === undefined) {
      return res.status(400).json({ message: "Missing required performance fields" });
    }

    // 2. Use findOneAndUpdate with upsert:true 
    // This prevents duplicate records for the same student/exam/subject
    const perf = await Performance.findOneAndUpdate(
      { 
        student: studentId, 
        examName: examName, 
        subject: subject 
      },
      {
        $set: {
          marksObtained: Number(marksObtained),
          totalMarks: Number(totalMarks) || 100,
          class: classGrade,
          section: section,
          teacher: req.user._id,  // Injected by your protect middleware
          school: req.user.school // Injected by your protect middleware
        }
      },
      { new: true, upsert: true }
    );

    res.status(201).json({ 
      message: "Performance record saved successfully", 
      performanceId: perf._id 
    });
  } catch (error) {
    console.error("Add Performance Error:", error);
    res.status(500).json({ 
      message: "Server error while adding performance", 
      error: error.message 
    });
  }
};