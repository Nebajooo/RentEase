const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getAllUsers,
  suspendUser,
  unsuspendUser,
  verifyKYC,
  getPropertiesForModeration,
  approveProperty,
  rejectProperty,
  getAdminStats,
  getDisputes,
  resolveDispute,
  getSystemLogs,
  deletePropertyByAdmin,
  deleteUserByAdmin,
  getPlatformAnalytics,
  sendSystemNotification,
  getReports,
  resolveReport,
} = require("../controllers/adminController");

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize("admin"));

// Dashboard & Analytics
router.get("/stats", getAdminStats);
router.get("/analytics", getPlatformAnalytics);
router.get("/logs", getSystemLogs);

// User management
router.get("/users", getAllUsers);
router.put("/users/:id/suspend", suspendUser);
router.put("/users/:id/unsuspend", unsuspendUser);
router.put("/users/:id/verify-kyc", verifyKYC);
router.delete("/users/:id", deleteUserByAdmin);

// Property moderation
router.get("/properties", getPropertiesForModeration);
router.put("/properties/:id/approve", approveProperty);
router.put("/properties/:id/reject", rejectProperty);
router.delete("/properties/:id", deletePropertyByAdmin);

router.get("/disputes", getDisputes);
router.put("/disputes/:id/resolve", resolveDispute);

router.get("/reports", getReports);
router.put("/reports/:id/resolve", resolveReport);

router.post("/notifications/send", sendSystemNotification);

module.exports = router;
