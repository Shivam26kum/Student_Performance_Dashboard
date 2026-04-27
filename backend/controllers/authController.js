const Admin = require("../models/Admin");
const Teacher = require("../models/Teacher");
const Parent = require("../models/Parent");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "24h",
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let Model;
    const normalizedRole = role.toLowerCase().trim();

    // Select correct Model based on role
    switch (normalizedRole) {
      case "admin":
        Model = Admin;
        break;
      case "teacher":
        Model = Teacher;
        break;
      case "parent":
        Model = Parent;
        break;
      default:
        return res.status(400).json({ message: "Invalid role selected" });
    }

    // 1. Find user (Case-insensitive email check)
    const user = await Model.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 2. Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Send Response
    res.status(200).json({
      token: generateToken(user._id),
      _id: user._id,
      name: user.name,
      email: user.email,
      role: normalizedRole,
    });
    
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};