const Student = require("../models/Student");
const Performance = require("../models/Performance");
const Attendance = require("../models/Attendance");
const Parent = require("../models/Parent");
const Schedule = require("../models/Schedule");
const Notice = require("../models/Notice");
const Teacher = require("../models/Teacher");
const Material = require("../models/Material"); // Ensure you have this model
const bcrypt = require("bcryptjs");

// --- HELPER: NORMALIZE DATE (UTC MIDNIGHT) ---
const normalizeDate = (dateString) => {
  const date = new Date(dateString);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
};

// --- 1. GET STUDENTS BY CLASS ---
exports.getStudentsByClass = async (req, res) => {
  try {
    const { classGrade, section, subject, startDate, endDate } = req.query;
    const schoolId = req.user.school;

    if (!classGrade || !section) {
      return res.status(400).json({ message: "Class and Section required" });
    }

    const students = await Student.find({ school: schoolId, class: classGrade, section: section })
      .populate("parent")
      .sort({ rollNo: 1 })
      .lean();

    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const attendanceQuery = { student: student._id };
        if (subject) attendanceQuery.subject = subject;

        if (startDate && endDate) {
          attendanceQuery.date = {
            $gte: normalizeDate(startDate),
            $lte: normalizeDate(endDate),
          };
        }

        const attendanceRecords = await Attendance.find(attendanceQuery).lean();

        let attendancePercentage = 0;
        if (attendanceRecords.length > 0) {
          const presentCount = attendanceRecords.filter((a) => a.status === "Present").length;
          attendancePercentage = ((presentCount / attendanceRecords.length) * 100).toFixed(1);
        }

        return {
          ...student,
          attendancePercentage: attendanceRecords.length > 0 ? attendancePercentage : null,
        };
      })
    );

    res.json(studentsWithStats);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// --- 2. GET MY CLASSES ---
exports.getMyClasses = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user._id).select("assignedClasses").lean();
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json(teacher.assignedClasses || []);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// --- 3. CREATE STUDENT ---
exports.createStudent = async (req, res) => {
  try {
    const { name, rollNo, class: cls, section } = req.body;
    const student = await Student.create({
      name, rollNo, class: cls, section,
      teacher: req.user._id,
      school: req.user.school,
    });
    res.status(201).json({ message: "Student created", studentId: student._id });
  } catch (error) {
    res.status(500).json({ message: "Error creating student" });
  }
};

// --- 4. DELETE STUDENT ---
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (student.parent) {
      await Parent.findByIdAndDelete(student.parent);
    }

    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student and associated parent account deleted" });
  } catch (error) {
    res.status(500).json({ message: "Deletion failed" });
  }
};

// --- 5. CREATE PARENT ---
exports.createParent = async (req, res) => {
  try {
    const { name, email, password, studentId, phone } = req.body; 
    if (!studentId) return res.status(400).json({ message: "Student ID required" });

    const existingParent = await Parent.findOne({ email });
    if (existingParent) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const parent = await Parent.create({
      name, email, password: hashed, phone, 
      student: studentId, school: req.user.school,
    });

    await Student.findByIdAndUpdate(studentId, { parent: parent._id });
    res.status(201).json({ message: "Parent linked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating parent" });
  }
};

// --- 6. GET STUDENTS ---
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find({ teacher: req.user._id }).populate("parent").lean();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// --- 7. GET DASHBOARD STATS ---
exports.getDashboardStats = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const schoolId = req.user.school;
    const { classGrade, section, subject, startDate, endDate } = req.query;

    const students = await Student.find({ school: schoolId, class: classGrade, section: section }).select("_id").lean();
    const studentIds = students.map((s) => s._id);

    const dateFilter = startDate && endDate ? { $gte: normalizeDate(startDate), $lte: normalizeDate(endDate) } : null;

    // Performance & Exam Logic
    const perfQuery = { 
        student: { $in: studentIds },
        class: classGrade,
        section: section
    };
    if (subject) perfQuery.subject = subject; 
    if (dateFilter) perfQuery.createdAt = dateFilter;

    const latestPerformance = await Performance.findOne(perfQuery).sort({ updatedAt: -1 }).lean();

    let classAverage = 0;
    if (latestPerformance) {
      const latestExamRecords = await Performance.find({
        ...perfQuery,
        examName: latestPerformance.examName
      }).lean();

      const totalObtained = latestExamRecords.reduce((acc, curr) => acc + curr.marksObtained, 0);
      const totalMax = latestExamRecords.reduce((acc, curr) => acc + curr.totalMarks, 0);
      classAverage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    }

    // Attendance & Schedule Parallel Fetch
    const attQuery = { student: { $in: studentIds } };
    if (subject) attQuery.subject = subject;
    if (dateFilter) attQuery.date = dateFilter;

    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

    const [totalAttendanceRecords, schedule, notices] = await Promise.all([
      Attendance.find(attQuery).lean(),
      Schedule.find({ teacher: teacherId, day: dayName }).sort({ startTime: 1 }).lean(),
      Notice.find({ school: schoolId, audience: { $in: ["teacher", "all"] } }).sort({ createdAt: -1 }).limit(5).lean()
    ]);

    const presentCount = totalAttendanceRecords.filter((a) => a.status === "Present").length;
    const attendancePercentage = studentIds.length > 0 ? (presentCount / (totalAttendanceRecords.length || 1)) * 100 : 0;

    res.json({
      totalStudents: studentIds.length,
      classAverage: classAverage.toFixed(1),
      attendancePercentage: attendancePercentage.toFixed(1),
      schedule,
      notices,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// --- 8. MARK ATTENDANCE ---
exports.markAttendance = async (req, res) => {
  try {
    const { date, attendanceData, subject } = req.body;
    const normalizedDate = normalizeDate(date);
    const bulkOps = attendanceData.map((record) => ({
      updateOne: {
        filter: { student: record.studentId, date: normalizedDate, subject: subject },
        update: {
          $set: {
            status: record.status,
            teacher: req.user._id,
            school: req.user.school,
            subject: subject,
          },
        },
        upsert: true,
      },
    }));
    await Attendance.bulkWrite(bulkOps);
    res.json({ message: "Attendance marked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Marking failed" });
  }
};

// --- 9. GET ATTENDANCE BY DATE ---
exports.getAttendanceByDate = async (req, res) => {
  try {
    const normalizedDate = normalizeDate(req.params.date);
    const query = { teacher: req.user._id, date: normalizedDate };
    if (req.query.subject) query.subject = req.query.subject;
    const records = await Attendance.find(query).lean();
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed" });
  }
};

// --- 10. GET ATTENDANCE REPORT ---
exports.getAttendanceReport = async (req, res) => {
  try {
    const query = {
      teacher: req.user._id,
      date: { $gte: normalizeDate(req.query.startDate), $lte: normalizeDate(req.query.endDate) },
    };
    if (req.query.subject) query.subject = req.query.subject;
    const records = await Attendance.find(query).populate("student", "name rollNo").lean();
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Report failed" });
  }
};

// --- 11. CREATE NOTICE ---
exports.createNotice = async (req, res) => {
  try {
    const { title, content, audience } = req.body;
    const notice = await Notice.create({
      title, content,
      audience: audience || "parent",
      school: req.user.school,
      postedBy: req.user._id,
      authorName: req.user.name,
      authorRole: "Teacher",
    });
    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 12. UPDATE PARENT ---
exports.updateParent = async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id);
    if (!parent) return res.status(404).json({ message: "Parent not found" });

    if (req.body.name) parent.name = req.body.name;
    if (req.body.email) parent.email = req.body.email;
    if (req.body.phone) parent.phone = req.body.phone;
    if (req.body.password) parent.password = await bcrypt.hash(req.body.password, 10); 

    await parent.save();
    res.json({ message: "Parent updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

// --- 13. GET NOTICES ---
exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ school: req.user.school }).sort({ createdAt: -1 }).lean();
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 14. SUBMIT EXAM MARKS ---
exports.submitMarks = async (req, res) => {
  try {
    const { examName, totalMarks, marksData, subject, classGrade, section } = req.body;

    const bulkOps = marksData.map((item) => ({
      updateOne: {
        filter: { student: item.studentId, examName, subject },
        update: {
          $set: {
            marksObtained: Number(item.marksObtained),
            totalMarks: Number(totalMarks),
            teacher: req.user._id,
            school: req.user.school,
            class: classGrade,
            section,
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        upsert: true,
      },
    }));

    await Performance.bulkWrite(bulkOps);
    res.json({ message: "Marks uploaded successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload marks" });
  }
};

// --- 15. GET MARKS BY EXAM ---
exports.getMarksByExam = async (req, res) => {
  try {
    const records = await Performance.find({ 
      examName: req.query.examName, 
      subject: req.query.subject, 
      class: req.query.classGrade, 
      section: req.query.section 
    }).lean();
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Fetch marks failed" });
  }
};

// --- 16. GET LIST OF EXAMS FOR A CLASS ---
exports.getClassExams = async (req, res) => {
  try {
    const exams = await Performance.distinct("examName", {
      class: req.query.classGrade,
      section: req.query.section,
      subject: req.query.subject,
      school: req.user.school
    });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch exam list" });
  }
};

// --- 17. DELETE EXAM PERFORMANCE ---
exports.deleteExamPerformance = async (req, res) => {
  try {
    const { examName, subject, classGrade, section } = req.query;
    await Performance.deleteMany({
      examName, subject,
      class: classGrade,
      section,
      school: req.user.school
    });
    res.json({ message: "Exam record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete exam record" });
  }
};

// --- 18. DELETE NOTICE ---
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    if (notice.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized deletion" });
    }

    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete notice" });
  }
};

// --- 19. NEW: GET TEACHER FULL ROUTINE ---
exports.getTeacherSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.find({ teacher: req.user._id }).sort({ startTime: 1 }).lean();
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const formatted = days.reduce((acc, day) => {
      acc[day] = schedule.filter(s => s.day === day);
      return acc;
    }, {});
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Routine fetch failed" });
  }
};

// --- 20. NEW: MANAGE STUDY MATERIALS ---
exports.getStudyMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ school: req.user.school, teacher: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch materials" });
  }
};

exports.createMaterial = async (req, res) => {
  try {
    const { title, description, fileUrl, type, classGrade, section, subject } = req.body;
    const material = await Material.create({
      title, description, fileUrl, type, classGrade, section, subject,
      school: req.user.school,
      teacher: req.user._id,
      authorName: req.user.name
    });
    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ message: "Material upload failed" });
  }
};

// --- 21. NEW: GET/UPDATE TEACHER PROFILE ---
exports.getTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user._id).select("-password").lean();
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: "Profile fetch failed" });
  }
};

exports.updateTeacherProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const teacher = await Teacher.findByIdAndUpdate(req.user._id, updateData, { new: true }).select("-password");
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: "Profile update failed" });
  }
};