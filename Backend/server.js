const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads folder if it doesn't exist
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve uploaded images statically
app.use("/uploads", express.static("uploads"));

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/house_rental")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// ==================== SCHEMAS ====================

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "landlord", "tenant"],
    default: "tenant",
  },
  phone: { type: String },
  isVerified: { type: Boolean, default: true },
  isSuspended: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  propertyType: { type: String, default: "apartment" },
  amenities: { type: [String], default: [] },
  images: { type: [String], default: [] },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isAvailable: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const bookingSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: [
      "pending",
      "approved",
      "rejected",
      "cancelled",
      "completed",
      "active",
    ],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Property = mongoose.model("Property", propertySchema);
const Booking = mongoose.model("Booking", bookingSchema);

// ==================== AUTH MIDDLEWARE ====================

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, "mysecretkey");
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "User not found" });
      }
      next();
    } catch (error) {
      console.error("Auth error:", error);
      res.status(401).json({ success: false, message: "Not authorized" });
    }
  }
  if (!token) {
    res.status(401).json({ success: false, message: "No token provided" });
  }
};

const isAdmin = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Admin access required" });
  }
};

// ==================== AUTH ROUTES ====================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || "tenant",
    });

    const token = jwt.sign({ id: user._id }, "mysecretkey", {
      expiresIn: "30d",
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email);

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, "mysecretkey", {
      expiresIn: "30d",
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/users/profile", protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// ==================== PROPERTY ROUTES ====================

app.get("/api/properties", async (req, res) => {
  try {
    const properties = await Property.find({ isApproved: true })
      .populate("landlord", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/properties/featured", async (req, res) => {
  try {
    const properties = await Property.find({ isApproved: true })
      .limit(6)
      .populate("landlord", "name");
    res.json({ success: true, properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/properties/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "landlord",
      "name email phone",
    );
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }
    res.json({ success: true, property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/landlord/properties", protect, async (req, res) => {
  try {
    console.log("Fetching properties for landlord:", req.user.id);
    const properties = await Property.find({ landlord: req.user.id }).sort({
      createdAt: -1,
    });
    console.log(`Found ${properties.length} properties`);
    res.json({ success: true, properties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post(
  "/api/landlord/properties",
  protect,
  upload.array("images", 5),
  async (req, res) => {
    try {
      console.log("Received property data:", req.body);
      console.log("Files:", req.files);

      if (req.user.role !== "landlord") {
        return res
          .status(403)
          .json({
            success: false,
            message: "Only landlords can list properties",
          });
      }

      const {
        title,
        description,
        price,
        location,
        bedrooms,
        bathrooms,
        propertyType,
        amenities,
      } = req.body;

      if (
        !title ||
        !description ||
        !price ||
        !location ||
        !bedrooms ||
        !bathrooms
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Please provide all required fields",
          });
      }

      const imageUrls = req.files
        ? req.files.map((file) => `/uploads/${file.filename}`)
        : [];

      if (imageUrls.length === 0) {
        imageUrls.push(
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
        );
      }

      const property = await Property.create({
        title,
        description,
        price: Number(price),
        location,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        propertyType: propertyType || "apartment",
        amenities: amenities
          ? Array.isArray(amenities)
            ? amenities
            : JSON.parse(amenities)
          : [],
        images: imageUrls,
        landlord: req.user.id,
        isAvailable: true,
        isApproved: true,
      });

      console.log("Property created successfully:", property._id);

      res
        .status(201)
        .json({
          success: true,
          message: "Property listed successfully!",
          property,
        });
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

app.put(
  "/api/landlord/properties/:id",
  protect,
  upload.array("images", 5),
  async (req, res) => {
    try {
      console.log("Updating property:", req.params.id);

      const property = await Property.findById(req.params.id);
      if (!property) {
        return res
          .status(404)
          .json({ success: false, message: "Property not found" });
      }

      if (
        property.landlord.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res
          .status(403)
          .json({ success: false, message: "Not authorized" });
      }

      const {
        title,
        description,
        price,
        location,
        bedrooms,
        bathrooms,
        propertyType,
        amenities,
        existingImages,
      } = req.body;

      let imageUrls = [];

      if (existingImages) {
        const existingImagesArray = Array.isArray(existingImages)
          ? existingImages
          : JSON.parse(existingImages);
        imageUrls = [...existingImagesArray];
      }

      if (req.files && req.files.length > 0) {
        const newImageUrls = req.files.map(
          (file) => `/uploads/${file.filename}`,
        );
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      if (imageUrls.length === 0) {
        imageUrls = [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
        ];
      }

      const updatedProperty = await Property.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          price: Number(price),
          location,
          bedrooms: Number(bedrooms),
          bathrooms: Number(bathrooms),
          propertyType: propertyType || "apartment",
          amenities: amenities
            ? Array.isArray(amenities)
              ? amenities
              : JSON.parse(amenities)
            : [],
          images: imageUrls,
          updatedAt: Date.now(),
        },
        { new: true },
      );

      console.log("Property updated successfully:", updatedProperty._id);
      res.json({
        success: true,
        message: "Property updated successfully!",
        property: updatedProperty,
      });
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

app.delete(
  "/api/landlord/properties/:id/images/:imageIndex",
  protect,
  async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);
      if (!property) {
        return res
          .status(404)
          .json({ success: false, message: "Property not found" });
      }

      if (
        property.landlord.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res
          .status(403)
          .json({ success: false, message: "Not authorized" });
      }

      const imageIndex = parseInt(req.params.imageIndex);
      if (imageIndex >= 0 && imageIndex < property.images.length) {
        property.images.splice(imageIndex, 1);
        await property.save();
      }

      res.json({
        success: true,
        message: "Image deleted successfully",
        images: property.images,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

app.delete("/api/landlord/properties/:id", protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    if (
      property.landlord.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (property.images && property.images.length > 0) {
      property.images.forEach((imagePath) => {
        if (imagePath && imagePath.startsWith("/uploads/")) {
          const filename = path.basename(imagePath);
          const fullPath = path.join(__dirname, "uploads", filename);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      });
    }

    await property.deleteOne();
    res.json({ success: true, message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.patch(
  "/api/landlord/properties/:id/toggle-availability",
  protect,
  async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);
      if (!property) {
        return res
          .status(404)
          .json({ success: false, message: "Property not found" });
      }

      if (
        property.landlord.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res
          .status(403)
          .json({ success: false, message: "Not authorized" });
      }

      property.isAvailable = !property.isAvailable;
      await property.save();

      res.json({
        success: true,
        message: `Property marked as ${property.isAvailable ? "Available" : "Rented"}`,
        isAvailable: property.isAvailable,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

// ==================== BOOKING ROUTES ====================

app.post("/api/bookings", protect, async (req, res) => {
  try {
    const { propertyId, startDate, endDate } = req.body;
    const property = await Property.findById(propertyId);
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    const duration = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24 * 30),
    );
    const totalAmount = property.price * (duration || 1);

    const booking = await Booking.create({
      tenant: req.user.id,
      property: propertyId,
      landlord: property.landlord,
      startDate,
      endDate,
      totalAmount,
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/bookings/my-bookings", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ tenant: req.user.id }).populate(
      "property",
      "title location price images",
    );
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/bookings/requests", protect, async (req, res) => {
  try {
    if (req.user.role !== "landlord") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    const requests = await Booking.find({
      landlord: req.user.id,
      status: "pending",
    })
      .populate("property", "title location images")
      .populate("tenant", "name email phone");
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/bookings/:id/approve", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    if (booking.landlord.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    booking.status = "approved";
    await booking.save();
    res.json({ success: true, message: "Booking approved" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/bookings/:id/reject", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    if (booking.landlord.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    booking.status = "rejected";
    await booking.save();
    res.json({ success: true, message: "Booking rejected" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ADMIN ROUTES ====================

app.get("/api/admin/stats", protect, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLandlords = await User.countDocuments({ role: "landlord" });
    const totalTenants = await User.countDocuments({ role: "tenant" });
    const totalProperties = await Property.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingProperties = await Property.countDocuments({
      isApproved: false,
    });

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          landlords: totalLandlords,
          tenants: totalTenants,
        },
        properties: { total: totalProperties, pending: pendingProperties },
        bookings: { total: totalBookings },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/admin/users", protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/admin/properties", protect, isAdmin, async (req, res) => {
  try {
    const properties = await Property.find({})
      .populate("landlord", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/admin/pending-properties", protect, isAdmin, async (req, res) => {
  try {
    const properties = await Property.find({ isApproved: false }).populate(
      "landlord",
      "name email",
    );
    res.json({ success: true, properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/admin/bookings", protect, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("tenant", "name email")
      .populate("property", "title location");
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/admin/users/:id/role", protect, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.role = role;
    await user.save();
    res.json({ success: true, message: "User role updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/admin/users/:id/suspend", protect, isAdmin, async (req, res) => {
  try {
    const { suspend } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.isSuspended = suspend;
    await user.save();
    res.json({
      success: true,
      message: suspend ? "User suspended" : "User unsuspended",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete("/api/admin/users/:id", protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.role === "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Cannot delete admin user" });
    }
    await user.deleteOne();
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put(
  "/api/admin/properties/:id/approve",
  protect,
  isAdmin,
  async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);
      if (!property) {
        return res
          .status(404)
          .json({ success: false, message: "Property not found" });
      }
      property.isApproved = true;
      await property.save();
      res.json({ success: true, message: "Property approved" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

// ==================== SEED DATABASE ====================

app.get("/api/seed", async (req, res) => {
  try {
    await User.deleteMany({});
    await Property.deleteMany({});
    await Booking.deleteMany({});

    const adminPassword = await bcrypt.hash("Admin@123", 10);
    const admin = await User.create({
      name: "Super Admin",
      email: "admin@houserentalsystem.com",
      password: adminPassword,
      role: "admin",
      phone: "9999999999",
      isVerified: true,
    });

    const landlordPassword = await bcrypt.hash("password123", 10);
    const landlord = await User.create({
      name: "John Smith",
      email: "landlord@example.com",
      password: landlordPassword,
      role: "landlord",
      phone: "9876543210",
      isVerified: true,
    });

    const tenantPassword = await bcrypt.hash("password123", 10);
    const tenant = await User.create({
      name: "Emma Wilson",
      email: "tenant@example.com",
      password: tenantPassword,
      role: "tenant",
      phone: "9876543213",
      isVerified: true,
    });

    await Property.create([
      {
        title: "Luxury Downtown Apartment",
        description: "Beautiful 2BHK apartment in the heart of the city",
        price: 25000,
        location: "Mumbai",
        bedrooms: 2,
        bathrooms: 2,
        propertyType: "apartment",
        amenities: ["AC", "WiFi", "Parking", "Gym"],
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
        ],
        landlord: landlord._id,
        isAvailable: true,
        isApproved: true,
      },
      {
        title: "Cozy Studio Near Tech Park",
        description: "Perfect for working professionals",
        price: 15000,
        location: "Bangalore",
        bedrooms: 1,
        bathrooms: 1,
        propertyType: "studio",
        amenities: ["AC", "WiFi", "Parking"],
        images: ["https://images.unsplash.com/photo-1560448204-603b3fc33ddc"],
        landlord: landlord._id,
        isAvailable: true,
        isApproved: true,
      },
      {
        title: "Family Home with Garden",
        description: "Spacious 3BHK house with garden",
        price: 35000,
        location: "Delhi",
        bedrooms: 3,
        bathrooms: 3,
        propertyType: "house",
        amenities: ["AC", "WiFi", "Parking", "Garden"],
        images: [
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
        ],
        landlord: landlord._id,
        isAvailable: true,
        isApproved: true,
      },
    ]);

    res.json({
      success: true,
      message: "Database seeded successfully!",
      credentials: {
        admin: { email: "admin@houserentalsystem.com", password: "Admin@123" },
        landlord: { email: "landlord@example.com", password: "password123" },
        tenant: { email: "tenant@example.com", password: "password123" },
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== START SERVER ====================

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
  console.log(`🌱 Seed Database: http://localhost:${PORT}/api/seed`);
  console.log(`📁 Uploads folder: ${path.join(__dirname, "uploads")}\n`);
});
