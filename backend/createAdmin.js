require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
const School = require("./models/School");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // 1. Create School if not exists
    let school = await School.findOne({ name: "Government Polytechnic College, Bhagalpur" });
    if (!school) {
      school = await School.create({ name: "Government Polytechnic College, Bhagalpur", address: "Barari, Bhagalpur, BIHAR" });
      console.log("School created:", school.name);
    }

    // 2. Check if Admin exists
    const existingAdmin = await Admin.findOne({ email: "admin@gpbgp.com" });
    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash("Admin@GPBGP", 10);

    // 4. Create Admin
    const admin = await Admin.create({
      name: "Principal K.K. Pathak",
      email: "admin@gpbgp.com",
      password: hashedPassword,
      school: school._id,
    });

    console.log("Admin created successfully!");
    console.log("Email: admin@gpbgp.com");
    console.log("Password: Admin@GPBGP");
    process.exit();
  } catch (error) {
    console.error("Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();
