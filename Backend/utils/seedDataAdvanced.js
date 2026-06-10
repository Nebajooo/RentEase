#!/usr/bin/env node

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");
const readline = require("readline");

dotenv.config({ path: path.join(__dirname, "../.env") });

// Import models
const User = require("../models/User");
const Property = require("../models/Property");
const Booking = require("../models/Booking");
const Review = require("../models/Review");

// Parse command line arguments
const args = process.argv.slice(2);
const shouldReset = args.includes("--reset") || args.includes("-r");
const shouldSkipConfirm = args.includes("--yes") || args.includes("-y");

// Create readline interface for confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(" MongoDB connection error:", error);
    process.exit(1);
  }
};

// Clear database
const clearDatabase = async () => {
  console.log("  Clearing database...");
  await User.deleteMany({});
  await Property.deleteMany({});
  await Booking.deleteMany({});
  await Review.deleteMany({});
  console.log(" Database cleared");
};

// Hash password helper
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Generate random date
const randomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
};

// Main seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    // Confirm if resetting
    if (shouldReset && !shouldSkipConfirm) {
      const answer = await question(
        "  This will delete all existing data. Are you sure? (y/N): ",
      );
      if (answer.toLowerCase() !== "y") {
        console.log(" Seeding cancelled");
        process.exit(0);
      }
    }

    if (shouldReset) {
      await clearDatabase();
    }

    // Check if data already exists
    const userCount = await User.countDocuments();
    if (userCount > 0 && !shouldReset) {
      console.log("Database already has data. Use --reset to reseed.");
      process.exit(0);
    }

    // Create users
    console.log("👤 Creating users...");

    const admin = await User.create({
      name: "System Admin",
      email: "admin@houserentalsystem.com",
      password: await hashPassword("Admin@123"),
      role: "admin",
      phone: "9999999999",
      isVerified: true,
      avatar:
        "https://ui-avatars.com/api/?background=3B82F6&color=fff&name=Admin",
    });

    const landlords = await User.create([
      {
        name: "John Smith",
        email: "john.smith@example.com",
        password: await hashPassword("Landlord@123"),
        role: "landlord",
        phone: "9876543210",
        isVerified: true,
        kycStatus: "approved",
        avatar:
          "https://ui-avatars.com/api/?background=10B981&color=fff&name=John+Smith",
      },
      {
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        password: await hashPassword("Landlord@123"),
        role: "landlord",
        phone: "9876543211",
        isVerified: true,
        kycStatus: "approved",
        avatar:
          "https://ui-avatars.com/api/?background=10B981&color=fff&name=Sarah+Johnson",
      },
    ]);

    const tenants = await User.create([
      {
        name: "Emma Wilson",
        email: "emma.wilson@example.com",
        password: await hashPassword("Tenant@123"),
        role: "tenant",
        phone: "9876543213",
        isVerified: true,
        avatar:
          "https://ui-avatars.com/api/?background=F59E0B&color=fff&name=Emma+Wilson",
      },
      {
        name: "James Davis",
        email: "james.davis@example.com",
        password: await hashPassword("Tenant@123"),
        role: "tenant",
        phone: "9876543214",
        isVerified: true,
        avatar:
          "https://ui-avatars.com/api/?background=F59E0B&color=fff&name=James+Davis",
      },
    ]);

    console.log(`✅ Created ${1 + landlords.length + tenants.length} users`);

    // Create properties
    console.log("🏠 Creating properties...");

    const propertyTemplates = [
      {
        title: "Luxury Downtown Apartment",
        description: "Beautiful 2BHK apartment in the heart of downtown.",
        price: 25000,
        address: {
          street: "123 Main Street",
          city: "Bole Atlas",
          state: "Bole",
          zipCode: "400001",
        },
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1200,
        propertyType: "apartment",
        amenities: ["AC", "WiFi", "Parking", "Gym", "Security"],
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
        ],
        isAvailable: true,
        isApproved: true,
      },
      {
        title: "Cozy Studio Near Tech Park",
        description: "Perfect for working professionals.",
        price: 15000,
        address: {
          street: "456 Tech Boulevard",
          city: "Addis Ababa",
          state: "Submit",
          zipCode: "560001",
        },
        bedrooms: 1,
        bathrooms: 1,
        sqft: 650,
        propertyType: "studio",
        amenities: ["AC", "WiFi", "Parking"],
        images: ["https://images.unsplash.com/photo-1560448204-603b3fc33ddc"],
        isAvailable: true,
        isApproved: true,
      },
      {
        title: "Family Home with Garden",
        description: "Spacious 3BHK house with garden.",
        price: 35000,
        address: {
          street: "789 Green Park",
          city: "Addis Ababa",
          state: "CMC",
          zipCode: "110001",
        },
        bedrooms: 3,
        bathrooms: 3,
        sqft: 2000,
        propertyType: "house",
        amenities: ["AC", "WiFi", "Parking", "Garden", "Security"],
        images: [
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
        ],
        isAvailable: true,
        isApproved: true,
      },
    ];

    const createdProperties = [];
    for (const template of propertyTemplates) {
      const landlord = landlords[Math.floor(Math.random() * landlords.length)];
      const property = await Property.create({
        ...template,
        landlord: landlord._id,
      });
      createdProperties.push(property);
    }

    console.log(`✅ Created ${createdProperties.length} properties`);

    // Create bookings
    console.log("📅 Creating bookings...");

    const bookingStatuses = ["pending", "approved", "active", "completed"];
    for (let i = 0; i < 5; i++) {
      const tenant = tenants[i % tenants.length];
      const property = createdProperties[i % createdProperties.length];
      const startDate = randomDate(
        new Date("2024-01-01"),
        new Date("2024-06-01"),
      );
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 3);

      await Booking.create({
        tenant: tenant._id,
        property: property._id,
        landlord: property.landlord,
        startDate,
        endDate,
        duration: 3,
        monthlyRent: property.price,
        securityDeposit: property.price,
        totalAmount: property.price * 4,
        status: bookingStatuses[i % bookingStatuses.length],
        paymentStatus: i % 2 === 0 ? "full_paid" : "deposit_paid",
      });
    }

    console.log(`✅ Created 5 bookings`);

    // Print summary
    console.log("\n✨ Database seeding completed!");
    console.log("\n🔑 Test Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`\n👑 Admin:`);
    console.log(`   Email: admin@houserentalsystem.com`);
    console.log(`   Password: Admin@123`);
    console.log(`\n🏘️ Landlords:`);
    landlords.forEach((l) => {
      console.log(`   Email: ${l.email} / Password: Landlord@123`);
    });
    console.log(`\n👤 Tenants:`);
    tenants.forEach((t) => {
      console.log(`   Email: ${t.email} / Password: Tenant@123`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
};

// Run seed
seedDatabase();
