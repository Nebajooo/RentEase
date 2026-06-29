const Property = require("../models/Property");
const Booking = require("../models/Booking");
const fs = require("fs");
const path = require("path");

exports.createProperty = async (req, res) => {
  try {
    // Get image URLs from uploaded files
    const imageUrls = req.files.map(
      (file) => `/${file.path.replace(/\\/g, "/")}`,
    );

    const propertyData = {
      ...req.body,
      landlord: req.user.id,
      images: imageUrls,
      amenities: req.body.amenities ? JSON.parse(req.body.amenities) : [],
      address: req.body.address ? JSON.parse(req.body.address) : {},
    };

    const property = await Property.create(propertyData);

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    // Clean up uploaded files if error occurs
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProperties = async (req, res) => {
  try {
    let query = { isApproved: true };

    // Search by location (text search)
    if (req.query.location) {
      query.$or = [
        { "address.city": { $regex: req.query.location, $options: "i" } },
        { "address.street": { $regex: req.query.location, $options: "i" } },
        { title: { $regex: req.query.location, $options: "i" } },
      ];
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseInt(req.query.maxPrice);
    }

    // Bedrooms filter
    if (req.query.bedrooms) {
      query.bedrooms =
        req.query.bedrooms === "4+"
          ? { $gte: 4 }
          : parseInt(req.query.bedrooms);
    }

    // Bathrooms filter
    if (req.query.bathrooms) {
      query.bathrooms =
        req.query.bathrooms === "3+"
          ? { $gte: 3 }
          : parseInt(req.query.bathrooms);
    }

    // Property type filter
    if (req.query.propertyType) {
      const types = req.query.propertyType.split(",");
      query.propertyType = { $in: types };
    }

    // Amenities filter
    if (req.query.amenities) {
      const amenities = req.query.amenities.split(",");
      query.amenities = { $all: amenities };
    }

    // Availability filter
    if (req.query.isAvailable !== undefined) {
      query.isAvailable = req.query.isAvailable === "true";
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Sorting
    let sort = {};
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case "price_asc":
          sort = { price: 1 };
          break;
        case "price_desc":
          sort = { price: -1 };
          break;
        case "newest":
          sort = { createdAt: -1 };
          break;
        case "oldest":
          sort = { createdAt: 1 };
          break;
        case "popular":
          sort = { views: -1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    }

    const properties = await Property.find(query)
      .populate("landlord", "name email phone avatar")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Property.countDocuments(query);

    res.status(200).json({
      success: true,
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "landlord",
      "name email phone avatar kycStatus isVerified",
    );

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    // Increment view count
    property.views += 1;
    await property.save();

    // Get similar properties (same city, similar price range)
    const similarProperties = await Property.find({
      _id: { $ne: property._id },
      "address.city": property.address.city,
      isApproved: true,
      isAvailable: true,
    })
      .limit(4)
      .select("title price images address.city bedrooms");

    res.status(200).json({
      success: true,
      property,
      similarProperties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    // Check ownership
    if (
      property.landlord.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    // Handle image updates
    let imageUrls = property.images;
    if (req.files && req.files.length > 0) {
      // Delete old images
      property.images.forEach((imagePath) => {
        const fullPath = path.join(__dirname, "..", imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
      // Add new images
      imageUrls = req.files.map((file) => `/${file.path.replace(/\\/g, "/")}`);
    }

    const updateData = {
      ...req.body,
      images: imageUrls,
      amenities: req.body.amenities
        ? JSON.parse(req.body.amenities)
        : property.amenities,
      address: req.body.address
        ? JSON.parse(req.body.address)
        : property.address,
    };

    property = await Property.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    // Check ownership
    if (
      property.landlord.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    // Delete all property images
    property.images.forEach((imagePath) => {
      const fullPath = path.join(__dirname, "..", imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    // Delete all bookings for this property
    await Booking.deleteMany({ property: property._id });

    // Delete property
    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    if (property.landlord.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    property.isAvailable = !property.isAvailable;
    await property.save();

    res.status(200).json({
      success: true,
      message: `Property marked as ${property.isAvailable ? "Available" : "Rented"}`,
      isAvailable: property.isAvailable,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ landlord: req.user.id }).sort({
      createdAt: -1,
    });

    // Get booking counts for each property
    const propertiesWithStats = await Promise.all(
      properties.map(async (property) => {
        const bookingCount = await Booking.countDocuments({
          property: property._id,
          status: { $in: ["approved", "active", "completed"] },
        });

        const pendingRequests = await Booking.countDocuments({
          property: property._id,
          status: "pending",
        });

        return {
          ...property.toObject(),
          bookingCount,
          pendingRequests,
        };
      }),
    );

    res.status(200).json({
      success: true,
      properties: propertiesWithStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      isApproved: true,
      isAvailable: true,
    })
      .sort({ views: -1, createdAt: -1 })
      .limit(6)
      .populate("landlord", "name");

    res.status(200).json({
      success: true,
      properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
