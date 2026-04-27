const Admin = require("../models/Admin");
const Teacher = require("../models/Teacher");
const School = require("../models/School");
const Class = require("../models/Class");
const Student = require("../models/Student");
const Notice = require("../models/Notice");
const Schedule = require("../models/Schedule");
const Material = require("../models/Material");
const bcrypt = require("bcryptjs");

// --- HELPER: Late Fee Utility (Grace period ends on the 7th) ---
const isLatePayment = () => {
  return new Date().getDate() > 7; 
};

// --- TEACHER CONTROLLERS ---

exports.createTeacher = async (req, res) => {
  try {
    const { name, email, password, phone, assignedClasses } = req.body;
    const schoolId = req.user.school; 
    
    const emailExists = await Teacher.findOne({ email });
    if (emailExists) return res.status(400).json({ message: "Teacher with this email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const teacher = await Teacher.create({ 
      name, email, password: hashed, phone, assignedClasses, school: schoolId 
    });
    
    res.status(201).json({ message: "Teacher created successfully", teacher });
  } catch (error) {
    res.status(500).json({ message: "Error creating teacher" });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, ...updateData } = req.body;

    if (password && password.trim() !== "") {
        updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedTeacher = await Teacher.findOneAndUpdate(
      { _id: id, school: req.user.school },
      updateData, 
      { new: true }
    ); 

    if (!updatedTeacher) return res.status(404).json({ message: "Teacher not found" });
    res.json(updatedTeacher);
  } catch (error) {
    res.status(500).json({ message: "Error updating teacher" });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const teacherId = req.params.id;
    const schoolId = req.user.school;
    const teacher = await Teacher.findOneAndDelete({ _id: teacherId, school: schoolId });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    await Student.updateMany({ teacher: teacherId, school: schoolId }, { $set: { teacher: null } });
    await Schedule.deleteMany({ teacher: teacherId, school: schoolId });
    
    res.json({ message: "Teacher and linked records removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ school: req.user.school })
      .select("-password").sort({ name: 1 }).lean();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// --- CLASS & FEE CONFIGURATION ---

exports.createClass = async (req, res) => {
  try {
    const { name } = req.body;
    const existingClass = await Class.findOne({ name, school: req.user.school });
    if (existingClass) return res.status(400).json({ message: "Class already exists" });

    const newClass = await Class.create({ name, school: req.user.school });
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: "Error creating class" });
  }
};

exports.getClasses = async (req, res) => {
  try {
    const schoolId = req.user.school;
    const classes = await Class.find({ school: schoolId }).lean();
    
    const result = await Promise.all(classes.map(async (cls) => {
      // FIX: Fuzzy matching so "Grade 10" matches "10" 
      const rawClassName = cls.name.replace(/class|grade/i, '').trim();
      const classRegex = new RegExp(rawClassName, 'i');

      const studentCount = await Student.countDocuments({ school: schoolId, class: classRegex });
      return { ...cls, studentCount };
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    await Class.findOneAndDelete({ _id: req.params.id, school: req.user.school });
    res.json({ message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.setClassFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { monthly, busFee, otherFee, penalty } = req.body;
    const schoolId = req.user.school;

    // 1. Update the Class Model with all values
    const updatedClass = await Class.findOneAndUpdate(
      { _id: id, school: schoolId },
      { 
        monthlyFee: Number(monthly) || 0, 
        busFee: Number(busFee) || 0,
        otherFee: Number(otherFee) || 0,
        lateFeePenalty: Number(penalty) || 0 
      },
      { new: true }
    );

    if (!updatedClass) return res.status(404).json({ message: "Class not found" });

    // 2. Calculate dynamic student total
    const baseFees = (Number(monthly) || 0) + (Number(busFee) || 0) + (Number(otherFee) || 0);
    const penaltyAmount = isLatePayment() ? (Number(penalty) || 0) : 0;
    const finalFeesTotal = baseFees + penaltyAmount;

    // FIX: Extract core number/name to ensure students actually get updated!
    const rawClassName = updatedClass.name.replace(/class|grade/i, '').trim();
    const classRegex = new RegExp(rawClassName, 'i');

    // 3. Sync all students in this specific class
    await Student.updateMany(
      { school: schoolId, class: classRegex },
      { 
        feesTotal: finalFeesTotal,
        appliedPenalty: penaltyAmount 
      }
    );

    res.json({ message: `Structure updated for ${updatedClass.name}. Students synchronized.` });
  } catch (error) {
    console.error("Set Fee Error:", error);
    res.status(500).json({ message: "Internal server error during fee sync" });
  }
};

// --- STUDENT CONTROLLERS ---

exports.createStudent = async (req, res) => {
  try {
    const { rollNo, class: cls, section } = req.body;
    const schoolId = req.user.school;
    
    const exists = await Student.findOne({ rollNo, class: cls, section, school: schoolId });
    if (exists) return res.status(400).json({ message: "Student roll number already exists" });

    // FIX: Fuzzy match Class policy to ensure new students get assigned fees instantly
    const rawClassName = cls.replace(/class|grade/i, '').trim();
    const classRegex = new RegExp(rawClassName, 'i');
    
    const classPolicy = await Class.findOne({ name: classRegex, school: schoolId });
    const baseFees = (classPolicy?.monthlyFee || 0) + (classPolicy?.busFee || 0) + (classPolicy?.otherFee || 0);
    const penaltyAmount = isLatePayment() ? (classPolicy?.lateFeePenalty || 0) : 0;

    const assignedTeacher = await Teacher.findOne({ 
      school: schoolId, "assignedClasses.classGrade": classRegex, "assignedClasses.section": new RegExp(`^${section}$`, 'i') 
    });

    const student = await Student.create({
      ...req.body,
      school: schoolId,
      teacher: assignedTeacher?._id || null,
      feesTotal: baseFees + penaltyAmount,
      appliedPenalty: penaltyAmount,
      feesPaid: 0
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: "Student creation failed" });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({ school: req.user.school }).sort({ class: 1, rollNo: 1 }).lean(); 
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const updated = await Student.findOneAndUpdate(
        { _id: req.params.id, school: req.user.school }, 
        req.body, 
        { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    await Student.findOneAndDelete({ _id: req.params.id, school: req.user.school });
    res.json({ message: "Student deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

exports.getStudentsByClass = async (req, res) => {
  try {
    const students = await Student.find({ school: req.user.school, class: req.params.className }).lean();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed" });
  }
};

// --- SCHEDULE / TIMETABLE CONTROLLERS ---

exports.createSchedule = async (req, res) => {
  try {
    const { teacher, day, startTime, endTime, classGrade, section } = req.body;
    const schoolId = req.user.school;

    const conflict = await Schedule.findOne({
      day, school: schoolId,
      $or: [
        { teacher, startTime: { $lt: endTime }, endTime: { $gt: startTime } },
        { classGrade, section, startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (conflict) return res.status(400).json({ message: `Time conflict with ${conflict.subject}` });

    const schedule = await Schedule.create({ ...req.body, school: schoolId });
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: "Failed to create schedule slot" });
  }
};

exports.getSchedules = async (req, res) => {
  try {
    const filter = { school: req.user.school, ...req.query };
    const schedules = await Schedule.find(filter).populate("teacher", "name").sort({ startTime: 1 }).lean();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch schedules" });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    await Schedule.findOneAndDelete({ _id: req.params.id, school: req.user.school });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

// --- MATERIAL OVERSIGHT ---

exports.getAllMaterialsAdmin = async (req, res) => {
  try {
    const materials = await Material.find({ school: req.user.school }).populate("teacher", "name").lean();
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed" });
  }
};

exports.deleteMaterialAdmin = async (req, res) => {
  try {
    await Material.findOneAndDelete({ _id: req.params.id, school: req.user.school });
    res.json({ message: "Material removed" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

// --- DASHBOARD STATS ---

exports.getAdminStats = async (req, res) => {
  try {
    const schoolId = req.user.school;
    const [tCount, cCount, sCount] = await Promise.all([
      Teacher.countDocuments({ school: schoolId }),
      Class.countDocuments({ school: schoolId }),
      Student.countDocuments({ school: schoolId })
    ]);

    const finances = await Student.aggregate([
      { $match: { school: schoolId } },
      { $group: { 
          _id: null, 
          collected: { $sum: "$feesPaid" }, 
          total: { $sum: "$feesTotal" } 
      }}
    ]);

    res.json({
      teachers: tCount,
      classes: cCount,
      students: sCount,
      isPenaltyActive: isLatePayment(),
      financials: { 
        collected: finances[0]?.collected || 0, 
        pending: (finances[0]?.total || 0) - (finances[0]?.collected || 0) 
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// --- NOTICES ---

exports.createNotice = async (req, res) => {
  try {
    const notice = await Notice.create({ ...req.body, school: req.user.school, postedBy: req.user._id });
    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: "Post failed" });
  }
};

exports.getAllNoticesAdmin = async (req, res) => {
  try {
    const notices = await Notice.find({ school: req.user.school }).sort({ createdAt: -1 }).lean();
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed" });
  }
};

exports.updateNotice = async (req, res) => {
  try {
    const updated = await Notice.findOneAndUpdate({ _id: req.params.id, school: req.user.school }, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    await Notice.findOneAndDelete({ _id: req.params.id, school: req.user.school });
    res.json({ message: "Notice deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

// --- ADMIN PROFILE ---

exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select("-password").lean();
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const admin = await Admin.findById(req.user._id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.name = name || admin.name;
    admin.email = email || admin.email;
    if (password && password.trim() !== "") admin.password = await bcrypt.hash(password, 10);
    
    await admin.save();
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};