const User = require("../models/User");
const Property = require("../models/Property");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const AdminLog = require("../models/AdminLog");
const { sendKYCStatusEmail } = require("../utils/emailService");

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { role, isVerified, isSuspended } = req.query;

    let query = {};
    if (role) query.role = role;
    if (isVerified) query.isVerified = isVerified === "true";
    if (isSuspended) query.isSuspended = isSuspended === "true";

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Suspend user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
exports.suspendUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot suspend admin users",
      });
    }

    user.isSuspended = true;
    user.suspensionReason = reason;
    await user.save();

    // Log admin action
    await AdminLog.create({
      admin: req.user.id,
      action: "suspend_user",
      targetType: "user",
      targetId: user._id,
      reason: reason,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `User ${user.email} has been suspended`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Unsuspend user
// @route   PUT /api/admin/users/:id/unsuspend
// @access  Private/Admin
exports.unsuspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isSuspended = false;
    user.suspensionReason = undefined;
    await user.save();

    await AdminLog.create({
      admin: req.user.id,
      action: "unsuspend_user",
      targetType: "user",
      targetId: user._id,
      reason: "User unsuspended",
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `User ${user.email} has been unsuspended`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify KYC
// @route   PUT /api/admin/users/:id/verify-kyc
// @access  Private/Admin
exports.verifyKYC = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "landlord") {
      return res.status(400).json({
        success: false,
        message: "User is not a landlord",
      });
    }

    user.kycStatus = status;
    await user.save();

    // Send KYC status email
    await sendKYCStatusEmail(user, status, reason);

    await AdminLog.create({
      admin: req.user.id,
      action: status === "approved" ? "verify_landlord" : "reject_kyc",
      targetType: "user",
      targetId: user._id,
      reason: `KYC ${status}`,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `KYC ${status} for ${user.name}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get properties for moderation
// @route   GET /api/admin/properties
// @access  Private/Admin
exports.getPropertiesForModeration = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status === "pending") query.isApproved = false;
    else if (status === "approved") query.isApproved = true;

    const properties = await Property.find(query)
      .populate("landlord", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Approve property
// @route   PUT /api/admin/properties/:id/approve
// @access  Private/Admin
exports.approveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    property.isApproved = true;
    await property.save();

    await AdminLog.create({
      admin: req.user.id,
      action: "approve_property",
      targetType: "property",
      targetId: property._id,
      reason: "Property approved",
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Property approved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reject property
// @route   PUT /api/admin/properties/:id/reject
// @access  Private/Admin
exports.rejectProperty = async (req, res) => {
  try {
    const { reason } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    await property.deleteOne();

    await AdminLog.create({
      admin: req.user.id,
      action: "reject_property",
      targetType: "property",
      targetId: property._id,
      reason: reason || "Property rejected",
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Property rejected and deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete admin users",
      });
    }

    // Delete all user data
    if (user.role === "landlord") {
      await Property.deleteMany({ landlord: user._id });
    }

    await Booking.deleteMany({
      $or: [{ tenant: user._id }, { landlord: user._id }],
    });

    await Review.deleteMany({ tenant: user._id });
    await user.deleteOne();

    await AdminLog.create({
      admin: req.user.id,
      action: "delete_user",
      targetType: "user",
      targetId: user._id,
      reason: "User deleted by admin",
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete property (Admin)
// @route   DELETE /api/admin/properties/:id
// @access  Private/Admin
exports.deletePropertyByAdmin = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    await property.deleteOne();

    await AdminLog.create({
      admin: req.user.id,
      action: "delete_property",
      targetType: "property",
      targetId: property._id,
      reason: "Property deleted by admin",
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get admin stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLandlords = await User.countDocuments({ role: "landlord" });
    const totalTenants = await User.countDocuments({ role: "tenant" });
    const suspendedUsers = await User.countDocuments({ isSuspended: true });
    const pendingKYC = await User.countDocuments({
      kycStatus: "pending",
      role: "landlord",
    });

    const totalProperties = await Property.countDocuments();
    const pendingProperties = await Property.countDocuments({
      isApproved: false,
    });
    const availableProperties = await Property.countDocuments({
      isAvailable: true,
    });
    const totalViews = await Property.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);

    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const activeBookings = await Booking.countDocuments({ status: "active" });
    const completedBookings = await Booking.countDocuments({
      status: "completed",
    });

    const totalRevenue = await Booking.aggregate([
      { $match: { status: { $in: ["completed", "active"] } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalReviews = await Review.countDocuments();
    const averageRating = await Review.aggregate([
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          totalUsers,
          totalLandlords,
          totalTenants,
          suspendedUsers,
          pendingKYC,
        },
        properties: {
          totalProperties,
          pendingProperties,
          availableProperties,
          totalViews: totalViews[0]?.total || 0,
        },
        bookings: {
          totalBookings,
          pendingBookings,
          activeBookings,
          completedBookings,
        },
        revenue: { total: totalRevenue[0]?.total || 0 },
        reviews: { totalReviews, averageRating: averageRating[0]?.avg || 0 },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get disputes
// @route   GET /api/admin/disputes
// @access  Private/Admin
exports.getDisputes = async (req, res) => {
  try {
    const disputes = await Booking.find({
      status: { $in: ["pending", "cancelled"] },
      cancellationReason: { $exists: true },
    })
      .populate("tenant", "name email")
      .populate("landlord", "name email")
      .populate("property", "title address")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      disputes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Resolve dispute
// @route   PUT /api/admin/disputes/:id/resolve
// @access  Private/Admin
exports.resolveDispute = async (req, res) => {
  try {
    const { resolution, refundAmount } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (resolution === "refund") {
      booking.status = "cancelled";
      // Process refund via Stripe
    } else if (resolution === "complete") {
      booking.status = "completed";
    }

    await booking.save();

    await AdminLog.create({
      admin: req.user.id,
      action: "resolve_dispute",
      targetType: "booking",
      targetId: booking._id,
      reason: `Dispute resolved: ${resolution}`,
      metadata: { refundAmount },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Dispute resolved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Private/Admin
exports.getSystemLogs = async (req, res) => {
  try {
    const logs = await AdminLog.find()
      .populate("admin", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getPlatformAnalytics = async (req, res) => {
  try {
    const monthlyUsers = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    const monthlyBookings = await Booking.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        userGrowth: monthlyUsers,
        bookingTrends: monthlyBookings,
        topProperties: await Property.find()
          .sort({ views: -1 })
          .limit(10)
          .select("title views"),
        topLandlords: await User.find({ role: "landlord" })
          .sort({ createdAt: -1 })
          .limit(10),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
