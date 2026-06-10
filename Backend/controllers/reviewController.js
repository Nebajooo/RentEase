const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Property = require("../models/Property");

// @desc    Create review for property
// @route   POST /api/reviews
// @access  Private (Tenant)
exports.createReview = async (req, res) => {
  try {
    const {
      bookingId,
      rating,
      cleanliness,
      accuracy,
      communication,
      location,
      value,
      comment,
    } = req.body;

    // Check if booking exists and user is tenant
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.tenant.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (booking.status !== "completed") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Can only review completed bookings",
        });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Review already submitted for this booking",
        });
    }

    const review = await Review.create({
      booking: bookingId,
      tenant: req.user.id,
      property: booking.property,
      landlord: booking.landlord,
      rating,
      cleanliness,
      accuracy,
      communication,
      location,
      value,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews for a property
// @route   GET /api/reviews/property/:propertyId
// @access  Public
exports.getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ property: propertyId })
      .populate("tenant", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ property: propertyId });

    // Calculate average ratings
    const aggregates = await Review.aggregate([
      { $match: { property: propertyId } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          avgCleanliness: { $avg: "$cleanliness" },
          avgAccuracy: { $avg: "$accuracy" },
          avgCommunication: { $avg: "$communication" },
          avgLocation: { $avg: "$location" },
          avgValue: { $avg: "$value" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const ratingDistribution = await Review.aggregate([
      { $match: { property: propertyId } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      averages: aggregates[0] || {
        avgRating: 0,
        avgCleanliness: 0,
        avgAccuracy: 0,
        avgCommunication: 0,
        avgLocation: 0,
        avgValue: 0,
        totalReviews: 0,
      },
      distribution: ratingDistribution,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Landlord response to review
// @route   PUT /api/reviews/:id/respond
// @access  Private (Landlord)
exports.respondToReview = async (req, res) => {
  try {
    const { response } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    if (review.landlord.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    review.landlordResponse = response;
    review.landlordResponseDate = Date.now();
    await review.save();

    res.status(200).json({
      success: true,
      message: "Response added to review",
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    review.helpful += 1;
    await review.save();

    res.status(200).json({
      success: true,
      message: "Marked as helpful",
      helpfulCount: review.helpful,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
