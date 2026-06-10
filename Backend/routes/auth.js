const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { validate, userValidation } = require("../middleware/validation");
const {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
  googleAuth,
  googleAuthCallback,
} = require("../controllers/authController");

// Public routes
router.post("/register", validate(userValidation.register), register);
router.post("/login", validate(userValidation.login), login);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// Google OAuth routes
router.get("/google", googleAuth);
router.get("/google/callback", googleAuthCallback);

// Protected routes
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;
