const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.join(__dirname, "../.env") });

// Import models
const User = require("../models/User");
const Property = require("../models/Property");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const AdminLog = require("../models/AdminLog");

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample data
const users = [
  // Admin User
  {
    name: "Admin User",
    email: "admin@houserentalsystem.com",
    password: "Admin@123",
    role: "admin",
    phone: "9999999999",
    isVerified: true,
    avatar:
      "https://ui-avatars.com/api/?background=3B82F6&color=fff&name=Admin",
  },
  // Landlord Users
  {
    name: "John Smith",
    email: "john.smith@example.com",
    password: "Landlord@123",
    role: "landlord",
    phone: "9876543210",
    isVerified: true,
    kycStatus: "approved",
    kycDocument: "/uploads/kyc/john_kyc.pdf",
    avatar:
      "https://ui-avatars.com/api/?background=10B981&color=fff&name=John+Smith",
  },
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    password: "Landlord@123",
    role: "landlord",
    phone: "9876543211",
    isVerified: true,
    kycStatus: "approved",
    avatar:
      "https://ui-avatars.com/api/?background=10B981&color=fff&name=Sarah+Johnson",
  },
  {
    name: "Michael Brown",
    email: "michael.brown@example.com",
    password: "Landlord@123",
    role: "landlord",
    phone: "9876543212",
    isVerified: true,
    kycStatus: "pending",
    avatar:
      "https://ui-avatars.com/api/?background=10B981&color=fff&name=Michael+Brown",
  },
  // Tenant Users
  {
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    password: "Tenant@123",
    role: "tenant",
    phone: "9876543213",
    isVerified: true,
    avatar:
      "https://ui-avatars.com/api/?background=F59E0B&color=fff&name=Emma+Wilson",
  },
  {
    name: "James Davis",
    email: "james.davis@example.com",
    password: "Tenant@123",
    role: "tenant",
    phone: "9876543214",
    isVerified: true,
    avatar:
      "https://ui-avatars.com/api/?background=F59E0B&color=fff&name=James+Davis",
  },
  {
    name: "Lisa Anderson",
    email: "lisa.anderson@example.com",
    password: "Tenant@123",
    role: "tenant",
    phone: "9876543215",
    isVerified: false,
    avatar:
      "https://ui-avatars.com/api/?background=F59E0B&color=fff&name=Lisa+Anderson",
  },
  {
    name: "Robert Taylor",
    email: "robert.taylor@example.com",
    password: "Tenant@123",
    role: "tenant",
    phone: "9876543216",
    isVerified: true,
    avatar:
      "https://ui-avatars.com/api/?background=F59E0B&color=fff&name=Robert+Taylor",
  },
];

const properties = [
  // John Smith's Properties (Landlord 1)
  {
    title: "Luxury Downtown Apartment",
    description:
      "Beautiful 2BHK apartment in the heart of downtown. Fully furnished with modern amenities. Walking distance to metro station, restaurants, and shopping malls. Features include AC, high-speed WiFi, modular kitchen, and 24/7 security.",
    price: 25000,
    address: {
      street: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001",
      coordinates: { lat: 19.076, lng: 72.8777 },
    },
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    propertyType: "apartment",
    amenities: [
      "AC",
      "WiFi",
      "Parking",
      "Gym",
      "Security",
      "Balcony",
      "Elevator",
    ],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    ],
    isAvailable: true,
    isApproved: true,
  },
  {
    title: "Cozy Studio Near Tech Park",
    description:
      "Perfect for working professionals. Compact yet spacious studio apartment near the tech park. Includes AC, WiFi, and parking. Close to supermarkets and cafes.",
    price: 15000,
    address: {
      street: "456 Tech Boulevard",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560001",
      coordinates: { lat: 12.9716, lng: 77.5946 },
    },
    bedrooms: 1,
    bathrooms: 1,
    sqft: 650,
    propertyType: "studio",
    amenities: ["AC", "WiFi", "Parking", "Security"],
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af",
    ],
    isAvailable: true,
    isApproved: true,
  },
  {
    title: "Family Home with Garden",
    description:
      "Spacious 3BHK house with a beautiful garden. Perfect for families. Includes parking, garden area, and modern kitchen. Located in a peaceful neighborhood.",
    price: 35000,
    address: {
      street: "789 Green Park",
      city: "Delhi",
      state: "Delhi",
      zipCode: "110001",
      coordinates: { lat: 28.7041, lng: 77.1025 },
    },
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2000,
    propertyType: "house",
    amenities: [
      "AC",
      "WiFi",
      "Parking",
      "Gym",
      "Pool",
      "Garden",
      "Security",
      "Pet-friendly",
    ],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
    ],
    isAvailable: false,
    isApproved: true,
  },

  // Sarah Johnson's Properties (Landlord 2)
  {
    title: "Beachside Condo",
    description:
      "Luxury condo with stunning ocean views. 2BHK with modern amenities. Direct beach access, swimming pool, and gym. Perfect for vacation or long-term stay.",
    price: 40000,
    address: {
      street: "321 Beach Road",
      city: "Goa",
      state: "Goa",
      zipCode: "403001",
      coordinates: { lat: 15.2993, lng: 74.124 },
    },
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1500,
    propertyType: "condo",
    amenities: [
      "AC",
      "WiFi",
      "Parking",
      "Gym",
      "Pool",
      "Security",
      "Balcony",
      "Elevator",
    ],
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
    ],
    isAvailable: true,
    isApproved: true,
  },
  {
    title: "Modern Penthouse",
    description:
      "Stunning penthouse with panoramic city views. 3BHK with luxury finishes. Includes private terrace, smart home features, and premium appliances.",
    price: 55000,
    address: {
      street: "567 Skyline Tower",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001",
      coordinates: { lat: 19.076, lng: 72.8777 },
    },
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2500,
    propertyType: "apartment",
    amenities: [
      "AC",
      "WiFi",
      "Parking",
      "Gym",
      "Pool",
      "Security",
      "Balcony",
      "Elevator",
      "SmartTV",
    ],
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
      "https://images.unsplash.com/photo-1501183638710-841dd1904471",
    ],
    isAvailable: true,
    isApproved: true,
  },
  {
    title: "Affordable 1BHK",
    description:
      "Budget-friendly apartment for students and young professionals. Basic amenities included. Close to metro station and shopping complex.",
    price: 12000,
    address: {
      street: "890 College Road",
      city: "Pune",
      state: "Maharashtra",
      zipCode: "411001",
      coordinates: { lat: 18.5204, lng: 73.8567 },
    },
    bedrooms: 1,
    bathrooms: 1,
    sqft: 550,
    propertyType: "apartment",
    amenities: ["WiFi", "Parking", "Security"],
    images: [
      "https://images.unsplash.com/photo-1560448204-603b3fc33ddc",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4",
    ],
    isAvailable: true,
    isApproved: true,
  },

  // More Properties
  {
    title: "Luxury Villa with Pool",
    description:
      "Exclusive 4BHK villa with private swimming pool. Large garden area, modern interior, and premium amenities. Located in a gated community.",
    price: 80000,
    address: {
      street: "111 Royal Enclave",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560001",
      coordinates: { lat: 12.9716, lng: 77.5946 },
    },
    bedrooms: 4,
    bathrooms: 4,
    sqft: 3500,
    propertyType: "villa",
    amenities: [
      "AC",
      "WiFi",
      "Parking",
      "Gym",
      "Pool",
      "Garden",
      "Security",
      "Pet-friendly",
      "Elevator",
    ],
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf",
    ],
    isAvailable: true,
    isApproved: true,
  },
  {
    title: "Cozy Cottage",
    description:
      "Charming 2BHK cottage in a quiet neighborhood. Perfect for couples or small families. Includes garden and parking.",
    price: 22000,
    address: {
      street: "222 Forest Lane",
      city: "Shimla",
      state: "Himachal Pradesh",
      zipCode: "171001",
      coordinates: { lat: 31.1048, lng: 77.1734 },
    },
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1100,
    propertyType: "house",
    amenities: ["WiFi", "Parking", "Garden", "Pet-friendly"],
    images: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
      "https://images.unsplash.com/photo-1449844908441-8829872d2607",
    ],
    isAvailable: true,
    isApproved: false, // Pending approval
  },
];

const bookings = [
  {
    tenant: null, // Will be set after users are created
    property: null, // Will be set after properties are created
    landlord: null,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-06-01"),
    duration: 5,
    monthlyRent: 25000,
    securityDeposit: 25000,
    totalAmount: 150000,
    status: "completed",
    paymentStatus: "full_paid",
    createdAt: new Date("2023-12-15"),
  },
  {
    tenant: null,
    property: null,
    landlord: null,
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-08-01"),
    duration: 6,
    monthlyRent: 15000,
    securityDeposit: 15000,
    totalAmount: 105000,
    status: "active",
    paymentStatus: "deposit_paid",
    createdAt: new Date("2024-01-20"),
  },
  {
    tenant: null,
    property: null,
    landlord: null,
    startDate: new Date("2024-03-15"),
    endDate: new Date("2024-04-15"),
    duration: 1,
    monthlyRent: 40000,
    securityDeposit: 40000,
    totalAmount: 80000,
    status: "pending",
    paymentStatus: "unpaid",
    createdAt: new Date("2024-03-10"),
  },
  {
    tenant: null,
    property: null,
    landlord: null,
    startDate: new Date("2024-04-01"),
    endDate: new Date("2024-10-01"),
    duration: 6,
    monthlyRent: 35000,
    securityDeposit: 35000,
    totalAmount: 245000,
    status: "approved",
    paymentStatus: "deposit_paid",
    createdAt: new Date("2024-03-25"),
  },
  {
    tenant: null,
    property: null,
    landlord: null,
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-03-15"),
    duration: 2,
    monthlyRent: 55000,
    securityDeposit: 55000,
    totalAmount: 165000,
    status: "cancelled",
    paymentStatus: "deposit_paid",
    cancellationReason: "Changed plans",
    cancelledAt: new Date("2024-01-20"),
    createdAt: new Date("2024-01-10"),
  },
];

const reviews = [
  {
    rating: 5,
    cleanliness: 5,
    accuracy: 5,
    communication: 5,
    location: 5,
    value: 4,
    comment:
      "Amazing property! Exactly as described. The host was very responsive and helpful. Would definitely recommend!",
  },
  {
    rating: 4,
    cleanliness: 4,
    accuracy: 4,
    communication: 5,
    location: 4,
    value: 4,
    comment: "Good property, nice location. A bit pricey but worth it.",
  },
  {
    rating: 5,
    cleanliness: 5,
    accuracy: 5,
    communication: 5,
    location: 5,
    value: 5,
    comment: "Perfect stay! Everything was great. Will book again.",
  },
];

// Helper function to hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Main seed function
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Property.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await AdminLog.deleteMany({});

    // Create users
    console.log("👤 Creating users...");
    const createdUsers = [];
    for (const userData of users) {
      const hashedPwd = await hashPassword(userData.password);
      const user = await User.create({
        ...userData,
        password: hashedPwd,
      });
      createdUsers.push(user);
    }

    // Map users by role and name
    const admin = createdUsers.find((u) => u.role === "admin");
    const landlords = createdUsers.filter((u) => u.role === "landlord");
    const tenants = createdUsers.filter((u) => u.role === "tenant");

    console.log(`✅ Created ${createdUsers.length} users`);
    console.log(`   - ${landlords.length} landlords`);
    console.log(`   - ${tenants.length} tenants`);
    console.log(`   - 1 admin`);

    // Create properties
    console.log("🏠 Creating properties...");
    const createdProperties = [];
    for (let i = 0; i < properties.length; i++) {
      const propertyData = properties[i];
      // Assign landlord in round-robin fashion
      const landlord = landlords[i % landlords.length];

      const property = await Property.create({
        ...propertyData,
        landlord: landlord._id,
      });
      createdProperties.push(property);
    }
    console.log(`✅ Created ${createdProperties.length} properties`);

    // Create bookings
    console.log("📅 Creating bookings...");
    const createdBookings = [];
    for (let i = 0; i < bookings.length; i++) {
      const bookingData = bookings[i];
      const tenant = tenants[i % tenants.length];
      const property = createdProperties[i % createdProperties.length];
      const landlord = await User.findById(property.landlord);

      const booking = await Booking.create({
        ...bookingData,
        tenant: tenant._id,
        property: property._id,
        landlord: landlord._id,
      });
      createdBookings.push(booking);
    }
    console.log(`✅ Created ${createdBookings.length} bookings`);

    // Create reviews
    console.log("⭐ Creating reviews...");
    const createdReviews = [];
    for (let i = 0; i < Math.min(reviews.length, createdBookings.length); i++) {
      const reviewData = reviews[i];
      const booking = createdBookings[i];
      const property = await Property.findById(booking.property);

      if (booking.status === "completed") {
        const review = await Review.create({
          ...reviewData,
          booking: booking._id,
          tenant: booking.tenant,
          property: booking.property,
          landlord: booking.landlord,
        });
        createdReviews.push(review);
      }
    }
    console.log(`✅ Created ${createdReviews.length} reviews`);

    // Create admin logs
    console.log("📝 Creating admin logs...");
    const adminLogs = [
      {
        admin: admin._id,
        action: "approve_property",
        targetType: "property",
        targetId: createdProperties[0]._id,
        reason: "Property verified and approved",
        ipAddress: "127.0.0.1",
      },
      {
        admin: admin._id,
        action: "verify_landlord",
        targetType: "user",
        targetId: landlords[0]._id,
        reason: "KYC documents verified",
        ipAddress: "127.0.0.1",
      },
    ];

    for (const logData of adminLogs) {
      await AdminLog.create(logData);
    }
    console.log(`✅ Created ${adminLogs.length} admin logs`);

    // Print summary
    console.log("\n📊 Seeding Summary:");
    console.log("═══════════════════════════════════");
    console.log(`✅ Users: ${createdUsers.length}`);
    console.log(`✅ Properties: ${createdProperties.length}`);
    console.log(`✅ Bookings: ${createdBookings.length}`);
    console.log(`✅ Reviews: ${createdReviews.length}`);
    console.log(`✅ Admin Logs: ${adminLogs.length}`);

    console.log("\n🔑 Test Credentials:");
    console.log("═══════════════════════════════════");
    console.log("\n👑 Admin User:");
    console.log("   Email: admin@houserentalsystem.com");
    console.log("   Password: Admin@123");

    console.log("\n🏘️ Landlord Users:");
    landlords.forEach((landlord, index) => {
      console.log(`   ${index + 1}. Email: ${landlord.email}`);
      console.log(`      Password: Landlord@123`);
    });

    console.log("\n👤 Tenant Users:");
    tenants.forEach((tenant, index) => {
      console.log(`   ${index + 1}. Email: ${tenant.email}`);
      console.log(`      Password: Tenant@123`);
    });

    console.log("\n✨ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run seed if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
