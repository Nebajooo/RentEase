const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getLandlordDashboard,
  getTenantDashboard,
  getRecentActivities,
  getUpcomingBookings,
  getNotifications,
  markAllNotificationsRead,
  getMonthlyStats,
} = require("../controllers/dashboardController");

router.use(protect);

// Role-specific dashboards
router.get("/landlord", authorize("landlord"), getLandlordDashboard);

router.get("/tenant", authorize("tenant"), getTenantDashboard);

// Shared dashboard features
router.get("/recent-activities", getRecentActivities);
router.get("/upcoming-bookings", getUpcomingBookings);
router.get("/notifications", getNotifications);
router.put("/notifications/mark-all-read", markAllNotificationsRead);
router.get("/monthly-stats", getMonthlyStats);

module.exports = router;
