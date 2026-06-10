const Booking = require("../models/Booking");
const Property = require("../models/Property");
const User = require("../models/User");
const {
  sendBookingRequestEmail,
  sendBookingApprovedEmail,
  sendBookingRejectedEmail,
} = require("../utils/emailService");

// @desc    Create booking request
// @route   POST /api/bookings
// @access  Private (Tenant)
exports.createBooking = async (req, res) => {
  try {
    const { propertyId, startDate, endDate, duration } = req.body;

    // Get property details
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (!property.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Property is not available",
      });
    }

    // Check if dates are available
    const existingBooking = await Booking.findOne({
      property: propertyId,
      status: { $in: ["pending", "approved", "active"] },
      $or: [
        { startDate: { $lte: new Date(endDate), $gte: new Date(startDate) } },
        { endDate: { $lte: new Date(endDate), $gte: new Date(startDate) } },
      ],
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Property already booked for these dates",
      });
    }

    // Calculate total amount
    const monthlyRent = property.price;
    const securityDeposit = monthlyRent; // 1 month deposit
    const totalAmount = monthlyRent * duration + securityDeposit;

    const booking = await Booking.create({
      tenant: req.user.id,
      property: propertyId,
      landlord: property.landlord,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      duration: parseInt(duration),
      monthlyRent,
      securityDeposit,
      totalAmount,
      status: "pending",
      paymentStatus: "unpaid",
    });

    // Populate booking details for email
    const populatedBooking = await Booking.findById(booking._id)
      .populate("tenant", "name email")
      .populate("landlord", "name email")
      .populate("property", "title address");

    // Send email notification to landlord
    await sendBookingRequestEmail(populatedBooking);

    res.status(201).json({
      success: true,
      message: "Booking request sent successfully",
      booking: {
        id: booking._id,
        startDate: booking.startDate,
        endDate: booking.endDate,
        duration: booking.duration,
        totalAmount: booking.totalAmount,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get my bookings (Tenant)
// @route   GET /api/bookings/my-bookings
// @access  Private (Tenant)
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ tenant: req.user.id })
      .populate("property", "title address images price propertyType")
      .populate("landlord", "name email phone avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get landlord booking requests
// @route   GET /api/bookings/requests
// @access  Private (Landlord)
exports.getBookingRequests = async (req, res) => {
  try {
    const requests = await Booking.find({
      landlord: req.user.id,
      status: "pending",
    })
      .populate("property", "title address images price")
      .populate("tenant", "name email phone avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get landlord all bookings
// @route   GET /api/bookings/landlord-bookings
// @access  Private (Landlord)
exports.getLandlordBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ landlord: req.user.id })
      .populate("property", "title address images price")
      .populate("tenant", "name email phone avatar")
      .sort({ createdAt: -1 });

    const stats = {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      approved: bookings.filter((b) => b.status === "approved").length,
      active: bookings.filter((b) => b.status === "active").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      totalEarnings: bookings
        .filter((b) => b.status === "completed" || b.status === "active")
        .reduce((sum, b) => sum + b.totalAmount, 0),
    };

    res.status(200).json({
      success: true,
      bookings,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get booking details
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("property", "title address images price propertyType amenities")
      .populate("tenant", "name email phone avatar")
      .populate("landlord", "name email phone avatar");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check authorization
    if (
      booking.tenant._id.toString() !== req.user.id &&
      booking.landlord._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Approve booking request
// @route   PUT /api/bookings/:id/approve
// @access  Private (Landlord)
exports.approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("tenant", "name email")
      .populate("landlord", "name email")
      .populate("property", "title");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.landlord._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Booking already processed",
      });
    }

    booking.status = "approved";
    booking.approvedAt = Date.now();
    await booking.save();

    // Send approval email to tenant
    await sendBookingApprovedEmail(booking);

    // Mark property as rented
    await Property.findByIdAndUpdate(booking.property._id, {
      isAvailable: false,
    });

    res.status(200).json({
      success: true,
      message: "Booking approved successfully",
      booking,
    });
  } catch (error) {
    console.error("Approve booking error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reject booking request
// @route   PUT /api/bookings/:id/reject
// @access  Private (Landlord)
exports.rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate("tenant", "name email")
      .populate("landlord", "name email")
      .populate("property", "title");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.landlord._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    booking.status = "rejected";
    booking.cancellationReason = reason || "Request rejected by landlord";
    booking.cancelledAt = Date.now();
    await booking.save();

    // Send rejection email to tenant
    await sendBookingRejectedEmail(booking, reason);

    res.status(200).json({
      success: true,
      message: "Booking rejected",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Cancel booking (Tenant)
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Tenant)
exports.cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.tenant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (booking.status !== "pending" && booking.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Booking cannot be cancelled",
      });
    }

    booking.status = "cancelled";
    booking.cancellationReason = reason || "Cancelled by tenant";
    booking.cancelledAt = Date.now();
    await booking.save();

    // If booking was approved, make property available again
    if (booking.status === "approved") {
      await Property.findByIdAndUpdate(booking.property, { isAvailable: true });
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Complete booking (after stay)
// @route   PUT /api/bookings/:id/complete
// @access  Private (Landlord/Tenant)
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.landlord.toString() !== req.user.id &&
      booking.tenant.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (booking.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Booking is not active",
      });
    }

    booking.status = "completed";
    booking.completedAt = Date.now();
    await booking.save();

    // Make property available again
    await Property.findByIdAndUpdate(booking.property, { isAvailable: true });

    res.status(200).json({
      success: true,
      message: "Booking marked as completed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Check property availability
// @route   POST /api/bookings/check-availability
// @access  Public
exports.checkAvailability = async (req, res) => {
  try {
    const { propertyId, startDate, endDate } = req.body;

    const existingBooking = await Booking.findOne({
      property: propertyId,
      status: { $in: ["approved", "active"] },
      $or: [
        { startDate: { $lte: new Date(endDate), $gte: new Date(startDate) } },
        { endDate: { $lte: new Date(endDate), $gte: new Date(startDate) } },
      ],
    });

    const isAvailable = !existingBooking;

    res.status(200).json({
      success: true,
      isAvailable,
      message: isAvailable
        ? "Property available for selected dates"
        : "Property not available for selected dates",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reschedule booking
// @route   PUT /api/bookings/:id/reschedule
// @access  Private
exports.rescheduleBooking = async (req, res) => {
  try {
    const { startDate, endDate, duration } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check authorization
    if (
      booking.tenant.toString() !== req.user.id &&
      booking.landlord.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Check availability for new dates
    const existingBooking = await Booking.findOne({
      property: booking.property,
      status: { $in: ["approved", "active"] },
      _id: { $ne: booking._id },
      $or: [
        { startDate: { $lte: new Date(endDate), $gte: new Date(startDate) } },
        { endDate: { $lte: new Date(endDate), $gte: new Date(startDate) } },
      ],
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "New dates are not available",
      });
    }

    // Update booking
    booking.startDate = new Date(startDate);
    booking.endDate = new Date(endDate);
    booking.duration = parseInt(duration);
    booking.totalAmount =
      booking.monthlyRent * duration + booking.securityDeposit;
    booking.status = "pending"; // Reset to pending for landlord approval
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking rescheduled successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Upload contract
// @route   POST /api/bookings/:id/upload-contract
// @access  Private (Landlord)
exports.uploadContract = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.landlord.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a contract file",
      });
    }

    booking.contractUrl = `/uploads/contracts/${req.file.filename}`;
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Contract uploaded successfully",
      contractUrl: booking.contractUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Sign contract
// @route   POST /api/bookings/:id/sign-contract
// @access  Private (Tenant)
exports.signContract = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.tenant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    booking.contractSigned = true;
    booking.contractSignedAt = Date.now();
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Contract signed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
