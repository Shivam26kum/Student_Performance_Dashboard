const Parent = require("../models/Parent");
const Student = require("../models/Student");
const Performance = require("../models/Performance");
const Attendance = require("../models/Attendance");
const Notice = require("../models/Notice");
const Schedule = require("../models/Schedule");
const Class = require("../models/Class");

/**
 * Utility to fetch parent and student context
 */
const getParentContext = async (userId) => {
  const parent = await Parent.findById(userId).populate("student").lean();
  if (!parent || !parent.student) {
    throw new Error("Student information not found. Please contact administration.");
  }
  return parent;
};

// --- 1. DASHBOARD ---
exports.getParentDashboard = async (req, res) => {
  try {
    const parent = await getParentContext(req.user._id);
    const studentId = parent.student._id;
    const schoolId = parent.school;

    const classRegex = new RegExp(`^${parent.student.class.trim()}$`, 'i');
    const studentSection = parent.student.section ? parent.student.section.trim() : "";
    const sectionRegex = new RegExp(`^${studentSection}$`, 'i');

    const [performances, attendanceRecords, notices, todaysSchedule] = await Promise.all([
      Performance.find({ student: studentId }).sort({ createdAt: -1 }).lean(),
      Attendance.find({ student: studentId }).lean(),
      Notice.find({
        school: schoolId,
        audience: { $in: ["student", "parent", "all"] }
      }).sort({ createdAt: -1 }).limit(5).lean(),
      Schedule.find({
        school: schoolId,
        classGrade: classRegex,
        $or: [
          { section: sectionRegex },
          { section: { $in: ["", null] } },
          { section: { $exists: false } }
        ],
        day: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date())
      }).sort({ startTime: 1 }).lean()
    ]);

    const totalTests = performances.length;
    let avgScore = 0;
    if (totalTests > 0) {
      const obtained = performances.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0);
      const total = performances.reduce((acc, curr) => acc + (curr.totalMarks || 0), 0);
      avgScore = total > 0 ? (obtained / total) * 100 : 0;
    }

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(a => a.status === "Present").length;
    const attPercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    res.json({
      student: parent.student,
      stats: {
        attendancePercentage: attPercentage.toFixed(1),
        averagePercentage: avgScore.toFixed(1),
        totalTests,
        feesPending: (parent.student.feesTotal || 0) - (parent.student.feesPaid || 0)
      },
      recentPerformance: performances.slice(0, 5),
      notices,
      schedule: todaysSchedule
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 2. ATTENDANCE PAGE ---
exports.getParentAttendanceData = async (req, res) => {
  try {
    const parent = await getParentContext(req.user._id);
    const records = await Attendance.find({ student: parent.student._id }).sort({ date: -1 }).lean();

    const totalDays = records.length;
    const present = records.filter(r => r.status === "Present").length;

    res.json({
      percentage: totalDays > 0 ? ((present / totalDays) * 100).toFixed(1) : 0,
      totalDays,
      present,
      absent: totalDays - present,
      history: records
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 3. FEES & PAYMENTS ---
exports.getFeeDetails = async (req, res) => {
  try {
    const parent = await getParentContext(req.user._id);
    const student = parent.student;

    // FIX: Use Regex to dynamically match class name (e.g., matching "10" with "Grade 10")
    const classStr = student.class ? student.class.trim() : "";
    // Creates a regex that looks for the class string anywhere in the name, case-insensitive
    const classRegex = new RegExp(classStr, 'i');

    const classPolicy = await Class.findOne({ 
      name: classRegex, 
      school: parent.school 
    }).lean();

    // Ensure we send numeric values, defaulting to 0 if undefined
    const total = student.feesTotal || 0;
    const paid = student.feesPaid || 0;
    const due = total - paid;

    res.json({
      monthlyFee: classPolicy?.monthlyFee || 0,
      busFee: classPolicy?.busFee || 0,
      otherFee: classPolicy?.otherFee || 0,
      appliedPenalty: student.appliedPenalty || 0,
      totalFees: total,
      paidFees: paid,
      dueFees: due > 0 ? due : 0, // Ensure it never goes negative
      nextDueDate: "2026-05-07", 
      transactions: student.transactions || [] 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createFeeOrder = async (req, res) => {
  try {
    res.status(200).json({ message: "Order creation logic pending key integration" });
  } catch (error) {
    res.status(500).json({ message: "Payment gateway error" });
  }
};

exports.verifyFeePayment = async (req, res) => {
  try {
    res.status(200).json({ message: "Verification logic pending" });
  } catch (error) {
    res.status(500).json({ message: "Payment verification failed" });
  }
};

// --- 4. PROFILE PAGE (GET) ---
exports.getParentProfileData = async (req, res) => {
  try {
    const parent = await getParentContext(req.user._id);
    const s = parent.student;

    res.json({
      student: {
        name: s.name,
        class: s.class,
        section: s.section,
        rollNo: s.rollNo,
        dob: s.dob,
        bloodGroup: s.bloodGroup,
        admissionNo: s.admissionNo
      },
      parent: {
        name: parent.name,
        relation: parent.relation,
        phone: parent.phone,
        email: parent.email,
        address: parent.address
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 5. EXAMS PAGE ---
exports.getParentExamsData = async (req, res) => {
  try {
    const parent = await getParentContext(req.user._id);
    const performances = await Performance.find({ student: parent.student._id }).sort({ createdAt: -1 }).lean();

    const examsGrouped = performances.reduce((acc, perf) => {
      const name = perf.examName || "General Assessment";
      if (!acc[name]) acc[name] = [];
      acc[name].push({
        subject: perf.subject,
        marksObtained: perf.marksObtained,
        totalMarks: perf.totalMarks,
        date: perf.createdAt
      });
      return acc;
    }, {});

    const formattedExams = Object.entries(examsGrouped).map(([examName, subjects]) => {
      const score = subjects.reduce((acc, curr) => acc + curr.marksObtained, 0);
      const total = subjects.reduce((acc, curr) => acc + curr.totalMarks, 0);
      return {
        examName,
        date: subjects[0].date,
        totalScore: score,
        maxPossible: total,
        percentage: total > 0 ? ((score / total) * 100).toFixed(1) : 0,
        subjects
      };
    });

    res.json(formattedExams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 6. SCHEDULE PAGE ---
exports.getParentScheduleData = async (req, res) => {
  try {
    const parent = await getParentContext(req.user._id);
    const classRegex = new RegExp(`^${parent.student.class.trim()}$`, 'i');
    const studentSection = parent.student.section ? parent.student.section.trim() : "";
    const sectionRegex = new RegExp(`^${studentSection}$`, 'i');

    const schedule = await Schedule.find({ 
      school: parent.school,
      classGrade: classRegex,
      $or: [
        { section: sectionRegex },
        { section: { $in: ["", null] } },
        { section: { $exists: false } }
      ]
    }).sort({ startTime: 1 }).lean();

    console.log(`[DEBUG] Found ${schedule.length} schedule records matching criteria.`);

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const formatted = days.reduce((acc, day) => {
      acc[day] = schedule
        .filter(s => s.day === day)
        .map(s => ({
          subject: s.subject,
          startTime: s.startTime,
          endTime: s.endTime,
          room: s.room || "N/A"
        }));
      return acc;
    }, {});

    res.json(formatted);
  } catch (error) {
    console.error("Schedule Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// --- 7. NOTICES PAGE ---
exports.getParentNoticesData = async (req, res) => {
  try {
    const parent = await getParentContext(req.user._id);
    const notices = await Notice.find({
      school: parent.school,
      audience: { $in: ["student", "parent", "all"] }
    }).sort({ createdAt: -1 }).lean();

    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 8. UPDATE PROFILE PAGE (PUT) ---
exports.updateParentProfile = async (req, res) => {
  try {
    const parent = await getParentContext(req.user._id);
    const { student: studentData, parent: parentData } = req.body;

    // 1. Update Parent Details in DB
    await Parent.findByIdAndUpdate(parent._id, {
      name: parentData.name,
      relation: parentData.relation,
      phone: parentData.phone,
      email: parentData.email,
      address: parentData.address
    });

    // 2. Update Student Details in DB
    await Student.findByIdAndUpdate(parent.student._id, {
      name: studentData.name,
      class: studentData.class,
      section: studentData.section,
      rollNo: studentData.rollNo,
      dob: studentData.dob,
      bloodGroup: studentData.bloodGroup,
      admissionNo: studentData.admissionNo
    });

    res.json({ message: "Profile successfully updated." });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Failed to update profile information." });
  }
};