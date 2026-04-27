const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Parent = require("../models/Parent");

/**
 * Import all controller functions from parentController.js
 * ensure these function names match exactly what is exported in the controller.
 */
const { 
  getParentDashboard, 
  getParentAttendanceData, 
  getFeeDetails,         // Matches: api.get("/api/parent/fee-details")
  createFeeOrder,        // Matches: api.post("/api/parent/create-order")
  verifyFeePayment,      // Matches: api.post("/api/parent/verify-payment")
  getParentProfileData,
  updateParentProfile,   // NEW: Added to handle profile edits
  getParentExamsData,
  getParentScheduleData,
  getParentNoticesData 
} = require("../controllers/parentController");

// --- DASHBOARD & PROFILE ---
router.get("/dashboard", protect(Parent), getParentDashboard);
router.get("/profile", protect(Parent), getParentProfileData);
// NEW: PUT route to handle saving profile edits from ParentProfile.jsx
router.put("/profile", protect(Parent), updateParentProfile); 

// --- ACADEMICS & ATTENDANCE ---
router.get("/attendance", protect(Parent), getParentAttendanceData);
router.get("/exams", protect(Parent), getParentExamsData);
router.get("/schedule", protect(Parent), getParentScheduleData);
router.get("/notices", protect(Parent), getParentNoticesData);

// --- FINANCIAL & PAYMENT ENDPOINTS ---

/** * GET /api/parent/fee-details
 * Fetches the breakdown of Tuition, Bus, Other fees and Penalty.
 * Resolves the 404 error in ParentFees.jsx.
 */
router.get("/fee-details", protect(Parent), getFeeDetails); 

/**
 * POST /api/parent/create-order
 * Triggered when parent clicks "Pay Now". 
 * Communicates with Razorpay API to generate an Order ID.
 */
router.post("/create-order", protect(Parent), createFeeOrder);

/**
 * POST /api/parent/verify-payment
 * Triggered by Razorpay Handler on frontend after successful swipe.
 * Verifies signature and updates Student.feesPaid in DB.
 */
router.post("/verify-payment", protect(Parent), verifyFeePayment);

module.exports = router;