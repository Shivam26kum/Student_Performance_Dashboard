const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Admin = require("../models/Admin");

// Import Controllers
const { 
  createTeacher, 
  updateTeacher, 
  getAllTeachers, 
  deleteTeacher,
  createClass, 
  getClasses, 
  getStudentsByClass, 
  deleteClass, 
  setClassFee, 
  getAdminStats, 
  createStudent, 
  getAllStudents, 
  updateStudent, 
  deleteStudent,
  createNotice, 
  getAllNoticesAdmin, 
  updateNotice, 
  deleteNotice,         
  createSchedule, 
  getSchedules, 
  deleteSchedule,       
  getAllMaterialsAdmin, 
  deleteMaterialAdmin,  
  getAdminProfile,
  updateAdminProfile
} = require("../controllers/adminController");

// --- 1. DASHBOARD & ANALYTICS ---
router.get("/stats", protect(Admin), getAdminStats);

// --- 2. TEACHER MANAGEMENT ---
router.route("/teachers")
  .get(protect(Admin), getAllTeachers)
  .post(protect(Admin), createTeacher);

router.route("/teachers/:id")
  .put(protect(Admin), updateTeacher)
  .delete(protect(Admin), deleteTeacher);

// --- 3. STUDENT MANAGEMENT ---
router.route("/students")
  .get(protect(Admin), getAllStudents)
  .post(protect(Admin), createStudent);

router.route("/students/:id") 
  .put(protect(Admin), updateStudent)
  .delete(protect(Admin), deleteStudent);

// --- 4. CLASS & FEE CONFIGURATION ---
router.route("/classes")
  .get(protect(Admin), getClasses)
  .post(protect(Admin), createClass);

router.delete("/classes/:id", protect(Admin), deleteClass);
router.get("/classes/:className/students", protect(Admin), getStudentsByClass);

// Linked correctly to api.put(`/api/admin/classes/${id}/set-fee`, payload)
router.put("/classes/:id/set-fee", protect(Admin), setClassFee);

// --- 5. TIMETABLE & SCHEDULES ---
router.route("/schedules")
  .get(protect(Admin), getSchedules)
  .post(protect(Admin), createSchedule);

router.delete("/schedules/:id", protect(Admin), deleteSchedule);

// --- 6. ACADEMIC MATERIALS ---
router.get("/materials", protect(Admin), getAllMaterialsAdmin);
router.delete("/materials/:id", protect(Admin), deleteMaterialAdmin);

// --- 7. NOTICES & ANNOUNCEMENTS ---
router.route("/notices")
  .get(protect(Admin), getAllNoticesAdmin)
  .post(protect(Admin), createNotice);

router.route("/notices/:id")
  .put(protect(Admin), updateNotice)
  .delete(protect(Admin), deleteNotice); 

// --- 8. ADMIN PROFILE & SETTINGS ---
router.route("/profile")
  .get(protect(Admin), getAdminProfile)
  .put(protect(Admin), updateAdminProfile);

module.exports = router;