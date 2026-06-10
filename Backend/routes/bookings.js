const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { validate, bookingValidation } = require("../middleware/validation");
const {
  createBooking,
  getMyBookings,
  getBookingRequests,
  getLandlordBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
  checkAvailability,
  getBookingDetails,
  rescheduleBooking,
  uploadContract,
  signContract,
} = require("../controllers/bookingController");

// Public routes
router.post("/check-availability", checkAvailability);

// Protected routes
router.use(protect);

// Tenant routes
router.post(
  "/",
  authorize("tenant"),
  validate(bookingValidation.create),
  createBooking,
);

router.get("/my-bookings", authorize("tenant"), getMyBookings);

router.put("/:id/cancel", authorize("tenant"), cancelBooking);

// Landlord routes
router.get("/requests", authorize("landlord"), getBookingRequests);

router.get("/landlord-bookings", authorize("landlord"), getLandlordBookings);

router.put("/:id/approve", authorize("landlord"), approveBooking);

router.put("/:id/reject", authorize("landlord"), rejectBooking);

// Shared routes (both tenant and landlord)
router.get("/:id", getBookingDetails);

router.put("/:id/complete", authorize("landlord", "tenant"), completeBooking);

router.put(
  "/:id/reschedule",
  authorize("landlord", "tenant"),
  rescheduleBooking,
);

// Contract routes
router.post("/:id/upload-contract", authorize("landlord"), uploadContract);

router.post("/:id/sign-contract", authorize("tenant"), signContract);

module.exports = router;
