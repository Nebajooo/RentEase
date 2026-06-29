const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  stripeWebhook,
  refundPayment,
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setupAutomaticPayments,
  getEarnings,
} = require("../controllers/paymentController");

// Webhook (needs raw body, no authentication)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

// Protected routes
router.use(protect);

router.post("/create-payment-intent", authorize("tenant"), createPaymentIntent);

router.post("/confirm-payment", authorize("tenant"), confirmPayment);

router.get("/history", authorize("tenant"), getPaymentHistory);

router.post("/:paymentId/refund", authorize("tenant", "admin"), refundPayment);

router.get("/methods", authorize("tenant"), getPaymentMethods);

router.post("/methods", authorize("tenant"), addPaymentMethod);

router.delete("/methods/:methodId", authorize("tenant"), removePaymentMethod);

// Automatic monthly payments
router.post("/setup-automatic", authorize("tenant"), setupAutomaticPayments);

router.get("/earnings", authorize("landlord"), getEarnings);

module.exports = router;
