const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  checkInWishlist,
  moveToCart,
} = require("../controllers/wishlistController");

router.use(protect);
router.use(authorize("tenant"));

router.get("/", getWishlist);
router.post("/:propertyId", addToWishlist);
router.delete("/:propertyId", removeFromWishlist);
router.get("/check/:propertyId", checkInWishlist);
router.post("/:propertyId/move-to-cart", moveToCart);

module.exports = router;
