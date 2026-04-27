const express = require("express");
const router = express.Router();
const { addPerformance } = require("../controllers/performanceController");
const { protect } = require("../middleware/authMiddleware");
const Teacher = require("../models/Teacher");

router.post("/add", protect(Teacher), addPerformance);

module.exports = router;
