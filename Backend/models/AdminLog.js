const mongoose = require("mongoose");

const adminLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "suspend_user",
        "unsuspend_user",
        "approve_property",
        "reject_property",
        "delete_property",
        "resolve_dispute",
        "verify_landlord",
        "reject_kyc",
      ],
      required: true,
    },
    targetType: {
      type: String,
      enum: ["user", "property", "booking", "review"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("AdminLog", adminLogSchema);
