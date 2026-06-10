const { body, validationResult } = require("express-validator");

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  };
};

// Validation rules
const userValidation = {
  register: [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("phone")
      .isLength({ min: 10, max: 10 })
      .withMessage("Phone must be 10 digits"),
  ],
  login: [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
};

const propertyValidation = {
  create: [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("bedrooms").isNumeric().withMessage("Bedrooms must be a number"),
    body("bathrooms").isNumeric().withMessage("Bathrooms must be a number"),
    body("propertyType").notEmpty().withMessage("Property type is required"),
  ],
};

const bookingValidation = {
  create: [
    body("startDate").isISO8601().withMessage("Valid start date is required"),
    body("endDate").isISO8601().withMessage("Valid end date is required"),
    body("propertyId").notEmpty().withMessage("Property ID is required"),
  ],
};

module.exports = {
  validate,
  userValidation,
  propertyValidation,
  bookingValidation,
};
