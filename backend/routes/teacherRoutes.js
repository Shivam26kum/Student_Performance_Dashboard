const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Teacher = require("../models/Teacher");

// --- 1. IMPORT ALL CONTROLLERS ---
const { 
  getStudentsByClass, 
  getMyClasses, 
  createStudent,
  deleteStudent,
  createParent, 
  updateParent, 
  getStudents, 
  getDashboardStats, 
  markAttendance, 
  getAttendanceByDate, 
  getAttendanceReport,
  getNotices,
  createNotice,
  deleteNotice,
  submitMarks,
  getMarksByExam,
  getClassExams,
  deleteExamPerformance,
  // --- NEWLY ADDED CONTROLLERS ---
  getTeacherSchedule,
  getStudyMaterials,
  createMaterial,
  getTeacherProfile,
  updateTeacherProfile
} = require("../controllers/teacherController");

// --- DASHBOARD ---
router.get("/stats", protect(Teacher), getDashboardStats);

// --- CLASS & STUDENT MANAGEMENT ---
router.get("/my-classes", protect(Teacher), getMyClasses);          
router.get("/class-students", protect(Teacher), getStudentsByClass); 
router.get("/students", protect(Teacher), getStudents);
router.post("/create-student", protect(Teacher), createStudent);
router.delete("/student/:id", protect(Teacher), deleteStudent); 

// --- ROUTINE / TIMETABLE ---
router.get("/my-schedule", protect(Teacher), getTeacherSchedule);

// --- STUDY MATERIALS ---
router.get("/materials", protect(Teacher), getStudyMaterials);
router.post("/create-material", protect(Teacher), createMaterial);

// --- PARENT MANAGEMENT ---
router.post("/create-parent", protect(Teacher), createParent);
router.put("/parent/:id", protect(Teacher), updateParent);

// --- ATTENDANCE ---
router.post("/mark-attendance", protect(Teacher), markAttendance);    
router.get("/attendance-report", protect(Teacher), getAttendanceReport); 
router.get("/attendance/:date", protect(Teacher), getAttendanceByDate);

// --- EXAMS & PERFORMANCE ---
router.post("/submit-performance", protect(Teacher), submitMarks);    
router.get("/get-performance", protect(Teacher), getMarksByExam);  
router.get("/class-exams", protect(Teacher), getClassExams);
router.delete("/delete-performance", protect(Teacher), deleteExamPerformance); 

// --- NOTICE BOARD ---
router.get("/notices", protect(Teacher), getNotices);
router.post("/create-notice", protect(Teacher), createNotice);
router.delete("/notice/:id", protect(Teacher), deleteNotice);

// --- TEACHER PROFILE ---
router.get("/profile", protect(Teacher), getTeacherProfile);
router.put("/profile/update", protect(Teacher), updateTeacherProfile);

module.exports = router;