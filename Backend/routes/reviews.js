const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createReview,
  getPropertyReviews,
  getMyReviews,
  respondToReview,
  markHelpful,
  updateReview,
  deleteReview,
  getLandlordReviews,
} = require("../controllers/reviewController");

// Public routes
router.get("/property/:propertyId", getPropertyReviews);

// Protected routes
router.use(protect);

// Review CRUD
router.post("/", authorize("tenant"), createReview);

router.get("/my-reviews", authorize("tenant"), getMyReviews);

router.get("/landlord-reviews", authorize("landlord"), getLandlordReviews);

router.put("/:id", authorize("tenant"), updateReview);

router.delete("/:id", authorize("tenant", "admin"), deleteReview);

// Review interactions
router.put("/:id/respond", authorize("landlord"), respondToReview);

router.post("/:id/helpful", markHelpful);

module.exports = router;
