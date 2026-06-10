// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// require("dotenv").config();

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   password: String,
//   role: String,
//   phone: String,
//   isVerified: Boolean,
// });

// const User = mongoose.model("User", userSchema);

// async function createAdmin() {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log("Connected to MongoDB");

//     // Check if admin exists
//     const existingAdmin = await User.findOne({ role: "admin" });
//     if (existingAdmin) {
//       console.log("Admin already exists:", existingAdmin.email);
//       process.exit(0);
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash("Admin@123", salt);

//     // Create admin
//     const admin = await User.create({
//       name: "Super Admin",
//       email: "admin@houserentalsystem.com",
//       password: hashedPassword,
//       role: "admin",
//       phone: "9999999999",
//       isVerified: true,
//     });

//     console.log("✅ Admin created successfully!");
//     console.log("📧 Email: admin@houserentalsystem.com");
//     console.log("🔑 Password: Admin@123");

//     process.exit(0);
//   } catch (error) {
//     console.error("Error:", error);
//     process.exit(1);
//   }
// }

// createAdmin();
