const express = require("express");
const router = express.Router();

// Import all route modules
const authRoutes = require("./auth");
const userRoutes = require("./users");
const propertyRoutes = require("./properties");
const bookingRoutes = require("./bookings");
const reviewRoutes = require("./reviews");
const paymentRoutes = require("./payments");
const adminRoutes = require("./admin");
const wishlistRoutes = require("./wishlist");
const dashboardRoutes = require("./dashboard");
const searchRoutes = require("./search");

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API version info
router.get("/version", (req, res) => {
  res.status(200).json({
    version: "1.0.0",
    name: "House Rental System API",
    description: "Complete house rental platform API",
  });
});

// Mount all routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/properties", propertyRoutes);
router.use("/bookings", bookingRoutes);
router.use("/reviews", reviewRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin", adminRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/search", searchRoutes);

// 404 handler for undefined routes
router.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
});

module.exports = router;
