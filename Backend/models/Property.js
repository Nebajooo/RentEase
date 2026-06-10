const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [5000, "Description cannot be more than 5000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
      min: [0, "Price must be at least 0"],
    },
    address: {
      street: String,
      city: {
        type: String,
        required: true,
      },
      state: String,
      zipCode: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    sqft: {
      type: Number,
      min: 0,
    },
    propertyType: {
      type: String,
      enum: ["apartment", "house", "condo", "studio", "villa", "townhouse"],
      required: true,
    },
    amenities: [
      {
        type: String,
        enum: [
          "AC",
          "WiFi",
          "Parking",
          "Gym",
          "Pet-friendly",
          "Pool",
          "Security",
          "Balcony",
          "Furnished",
          "Elevator",
          "Garden",
          "SmartTV",
        ],
      },
    ],
    images: [
      {
        type: String,
        required: true,
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Index for search
propertySchema.index({
  "address.city": "text",
  title: "text",
  description: "text",
});

module.exports = mongoose.model("Property", propertySchema);
