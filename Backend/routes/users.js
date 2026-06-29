const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { uploadAvatar, uploadKYC } = require("../middleware/upload");
const {
  getUserProfile,
  updateUserProfile,
  uploadAvatarHandler,
  uploadKYCHandler,
  getUserStats,
  verifyPhone,
  getAllUsers,
  deleteAccount,
  changePassword,
  getNotifications,
  markNotificationRead,
} = require("../controllers/userController");

// Protected routes (all user routes are protected)
router.use(protect);

// Profile routes
router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.put("/change-password", changePassword);
router.delete("/account", deleteAccount);

// Avatar upload
router.post("/upload-avatar", uploadAvatar, uploadAvatarHandler);

router.post("/verify-phone", verifyPhone);

// User statistics
router.get("/stats", getUserStats);

router.get("/notifications", getNotifications);
router.put("/notifications/:id/read", markNotificationRead);

router.post("/upload-kyc", authorize("landlord"), uploadKYC, uploadKYCHandler);

// Admin only routes
router.get("/all", authorize("admin"), getAllUsers);

module.exports = router;
