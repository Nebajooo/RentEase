const express = require("express");
const router = express.Router();
const {
  advancedSearch,
  getSearchSuggestions,
  saveSearch,
  getSavedSearches,
  deleteSavedSearch,
  getLocationSuggestions,
} = require("../controllers/searchController");
const { protect } = require("../middleware/auth");

// Public search routes
router.get("/", advancedSearch);
router.get("/suggestions", getSearchSuggestions);
router.get("/locations", getLocationSuggestions);

// Protected saved search routes
router.use(protect);
router.post("/save", saveSearch);
router.get("/saved", getSavedSearches);
router.delete("/saved/:id", deleteSavedSearch);

module.exports = router;
