const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { uploadPropertyImages } = require("../middleware/upload");
const { validate, propertyValidation } = require("../middleware/validation");
const {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  toggleAvailability,
  getMyProperties,
  getFeaturedProperties,
  getPropertiesByLandlord,
  incrementPropertyViews,
  reportProperty,
  saveProperty,
  getSavedProperties,
  getPropertyAnalytics,
} = require("../controllers/propertyController");

// Public routes
router.get("/", getProperties);
router.get("/featured", getFeaturedProperties);
router.get("/search", getProperties); // Search with filters
router.get("/:id", getPropertyById);
router.post("/:id/view", incrementPropertyViews);

// Protected routes (require authentication)
router.use(protect);

// Saved properties (for tenants)
router.post("/:id/save", saveProperty);
router.get("/saved/saved-properties", getSavedProperties);

// Landlord routes
router.post(
  "/",
  authorize("landlord"),
  uploadPropertyImages,
  validate(propertyValidation.create),
  createProperty,
);

router.get("/landlord/my-properties", authorize("landlord"), getMyProperties);

router.get(
  "/landlord/:userId/properties",
  authorize("landlord", "admin"),
  getPropertiesByLandlord,
);

router.put(
  "/:id",
  authorize("landlord", "admin"),
  uploadPropertyImages,
  updateProperty,
);

router.delete("/:id", authorize("landlord", "admin"), deleteProperty);

router.patch(
  "/:id/toggle-availability",
  authorize("landlord"),
  toggleAvailability,
);

router.get(
  "/:id/analytics",
  authorize("landlord", "admin"),
  getPropertyAnalytics,
);

// Report property (for tenants)
router.post("/:id/report", authorize("tenant"), reportProperty);

module.exports = router;
