// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// require("dotenv").config();

// async function fixAdminPassword() {
//   try {
//     await mongoose.connect(
//       process.env.MONGODB_URI || "mongodb://localhost:27017/house_rental",
//     );
//     console.log("Connected to database");

//     const usersCollection = mongoose.connection.db.collection("users");

//     // Generate correct hash for Admin@123
//     const correctHash = await bcrypt.hash("Admin@123", 10);
//     console.log("Correct hash:", correctHash);

//     // Update admin password
//     const result = await usersCollection.updateOne(
//       { email: "admin@houserentalsystem.com" },
//       { $set: { password: correctHash } },
//     );

//     if (result.modifiedCount > 0) {
//       console.log("✅ Admin password updated successfully!");
//       console.log("📧 Email: admin@houserentalsystem.com");
//       console.log("🔑 Password: Admin@123");
//     } else {
//       console.log("⚠️ Admin not found or password already correct");
//     }

//     process.exit(0);
//   } catch (error) {
//     console.error("Error:", error);
//     process.exit(1);
//   }
// }

// fixAdminPassword();
