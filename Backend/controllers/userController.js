const User = require("../models/User");
const Property = require("../models/Property");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const { sendKYCStatusEmail } = require("../utils/emailService");
const fs = require("fs");

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Upload avatar
// @route   POST /api/users/upload-avatar
// @access  Private
exports.uploadAvatarHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    const user = await User.findById(req.user.id);

    // Delete old avatar if exists
    if (user.avatar && !user.avatar.includes("ui-avatars.com")) {
      const oldAvatarPath = `uploads/avatars/${user.avatar.split("/").pop()}`;
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update avatar URL
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      success: true,
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Upload KYC document
// @route   POST /api/users/upload-kyc
// @access  Private (Landlord)
exports.uploadKYCHandler = async (req, res) => {
  try {
    if (req.user.role !== "landlord") {
      return res.status(403).json({
        success: false,
        message: "Only landlords can upload KYC",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload KYC document",
      });
    }

    const user = await User.findById(req.user.id);

    // Delete old KYC if exists
    if (user.kycDocument) {
      const oldKYCPath = `uploads/kyc/${user.kycDocument.split("/").pop()}`;
      if (fs.existsSync(oldKYCPath)) {
        fs.unlinkSync(oldKYCPath);
      }
    }

    user.kycDocument = `/uploads/kyc/${req.file.filename}`;
    user.kycStatus = "pending";
    await user.save();

    res.status(200).json({
      success: true,
      message: "KYC document uploaded successfully",
      kycStatus: user.kycStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify phone
// @route   POST /api/users/verify-phone
// @access  Private
exports.verifyPhone = async (req, res) => {
  try {
    const { otp } = req.body;

    // For demo, accept any 6-digit OTP
    if (!otp || otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const user = await User.findById(req.user.id);
    user.isPhoneVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Phone verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    let stats = {};

    if (req.user.role === "landlord") {
      const properties = await Property.find({ landlord: req.user.id });
      const totalProperties = properties.length;
      const availableProperties = properties.filter(
        (p) => p.isAvailable,
      ).length;

      const bookings = await Booking.find({ landlord: req.user.id });
      const totalBookings = bookings.length;
      const activeBookings = bookings.filter(
        (b) => b.status === "active",
      ).length;
      const pendingRequests = bookings.filter(
        (b) => b.status === "pending",
      ).length;

      const totalEarnings = bookings
        .filter((b) => b.status === "completed" || b.status === "active")
        .reduce((sum, b) => sum + b.totalAmount, 0);

      const averageRating = await Review.aggregate([
        { $match: { landlord: req.user._id } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } },
      ]);

      stats = {
        totalProperties,
        availableProperties,
        rentedProperties: totalProperties - availableProperties,
        totalBookings,
        activeBookings,
        pendingRequests,
        totalEarnings,
        averageRating: averageRating[0]?.avgRating || 0,
      };
    } else if (req.user.role === "tenant") {
      const bookings = await Booking.find({ tenant: req.user.id });
      const totalBookings = bookings.length;
      const activeBookings = bookings.filter(
        (b) => b.status === "active",
      ).length;
      const completedBookings = bookings.filter(
        (b) => b.status === "completed",
      ).length;
      const pendingBookings = bookings.filter(
        (b) => b.status === "pending",
      ).length;

      const totalSpent = bookings
        .filter((b) => b.status === "completed" || b.status === "active")
        .reduce((sum, b) => sum + b.totalAmount, 0);

      const reviews = await Review.find({ tenant: req.user.id });

      stats = {
        totalBookings,
        activeBookings,
        completedBookings,
        pendingBookings,
        totalSpent,
        totalReviews: reviews.length,
      };
    }

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete account
// @route   DELETE /api/users/account
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Delete user data
    if (user.role === "landlord") {
      await Property.deleteMany({ landlord: user._id });
    }

    await Booking.deleteMany({
      $or: [{ tenant: user._id }, { landlord: user._id }],
    });

    await Review.deleteMany({ tenant: user._id });
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users/all
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
