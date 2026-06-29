const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const { sendPaymentConfirmationEmail } = require("../utils/emailService");

exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate(
      "property",
      "title",
    );

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

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalAmount * 100),
      currency: "usd",
      metadata: {
        bookingId: booking._id.toString(),
        propertyId: booking.property._id.toString(),
        tenantId: req.user.id,
      },
      description: `Security Deposit + First Month Rent for ${booking.property.title}`,
    });

    booking.stripePaymentIntentId = paymentIntent.id;
    await booking.save();

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: booking.totalAmount,
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      const booking = await Booking.findOne({
        stripePaymentIntentId: paymentIntentId,
      })
        .populate("tenant", "name email")
        .populate("property", "title");

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      booking.paymentStatus = "deposit_paid";
      booking.status = "active";
      await booking.save();

      // Send payment confirmation email
      await sendPaymentConfirmationEmail(booking, booking.totalAmount);

      // Update property availability
      await Property.findByIdAndUpdate(booking.property._id, {
        isAvailable: false,
      });

      res.status(200).json({
        success: true,
        message: "Payment confirmed, booking is now active",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment not successful",
      });
    }
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const bookings = await Booking.find({
      tenant: req.user.id,
      paymentStatus: { $ne: "unpaid" },
    })
      .populate("property", "title images address")
      .sort({ createdAt: -1 });

    const paymentHistory = bookings.map((booking) => ({
      bookingId: booking._id,
      property: booking.property,
      amount: booking.totalAmount,
      status: booking.paymentStatus,
      date: booking.createdAt,
      startDate: booking.startDate,
      endDate: booking.endDate,
    }));

    const totalSpent = bookings.reduce((sum, b) => sum + b.totalAmount, 0);

    res.status(200).json({
      success: true,
      payments: paymentHistory,
      totalSpent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    const refund = await stripe.refunds.create({
      payment_intent: paymentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason || "requested_by_customer",
    });

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      refund,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPaymentMethods = async (req, res) => {
  try {
    // Get customer's payment methods from Stripe
    // For demo, return dummy data
    res.status(200).json({
      success: true,
      methods: [
        { id: "1", brand: "visa", last4: "4242", expMonth: 12, expYear: 2024 },
      ],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.addPaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.body;

    // Attach payment method to customer
    // For demo, return success
    res.status(200).json({
      success: true,
      message: "Payment method added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.removePaymentMethod = async (req, res) => {
  try {
    const { methodId } = req.params;

    // Detach payment method
    res.status(200).json({
      success: true,
      message: "Payment method removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.setupAutomaticPayments = async (req, res) => {
  try {
    const { bookingId, paymentMethodId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.automaticPayments = true;
    booking.paymentMethodId = paymentMethodId;
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Automatic payments setup successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getEarnings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      landlord: req.user.id,
      status: { $in: ["completed", "active"] },
    });

    const totalEarnings = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const monthlyEarnings = {};

    bookings.forEach((booking) => {
      const month = booking.createdAt.toISOString().slice(0, 7);
      monthlyEarnings[month] =
        (monthlyEarnings[month] || 0) + booking.totalAmount;
    });

    res.status(200).json({
      success: true,
      totalEarnings,
      monthlyEarnings,
      transactionCount: bookings.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent ${paymentIntent.id} succeeded`);
      break;
    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      console.log(`Payment failed: ${failedPayment.id}`);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
