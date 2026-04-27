const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");

// Load Environment Variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// --- MIDDLEWARE ---
app.use(helmet()); // Security headers

// Updated CORS Configuration - This is what allows Vercel to fetch data!
app.use(cors({
  origin: [
    process.env.CLIENT_ORIGIN, // Put your Vercel URL in Render's Env Variables
    "http://localhost:3000",   // For local React development
    "http://localhost:5173"    // For local Vite development
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true // Crucial if you use JWT cookies or tokens
}));

app.use(express.json()); // Body parser

// Log requests in development mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// --- ROUTES ---

// Authentication (Admin, Teacher, Parent)
app.use("/api/auth", require("./routes/authRoutes"));

// Admin Actions (Teacher/Class management, Fee Policy Setup)
app.use("/api/admin", require("./routes/adminRoutes"));

// Teacher Actions (Attendance, Performance entry)
app.use("/api/teacher", require("./routes/teacherRoutes"));

// Parent Actions (Dashboard, Fee Breakdown, Razorpay Payments)
app.use("/api/parent", require("./routes/parentRoutes"));

// General Performance Tracking
app.use("/api/performance", require("./routes/performanceRoutes"));

// Root Endpoint
app.get("/", (req, res) => {
  res.json({
    status: "Active",
    message: "Campus Connect API is running",
    version: "2.0.0"
  });
});

// --- ERROR HANDLING MIDDLEWARE ---

// 404 Handler for undefined routes
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Global Error Handler (Prevents server crash on 500 errors)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`[Error]: ${err.message}`);
  
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections (e.g., DB connection loss)
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});