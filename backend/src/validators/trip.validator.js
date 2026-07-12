const { check, validationResult } = require('express-validator');

const validateTripCreation = [
  check('vehicle', 'Vehicle ID is required').notEmpty().isMongoId(),
  check('driver', 'Driver ID is required').notEmpty().isMongoId(),
  check('source', 'Source location is required').notEmpty(),
  check('destination', 'Destination location is required').notEmpty(),
  check('cargoWeight', 'Cargo weight must be a number').optional().isNumeric(),
  check('plannedDistance', 'Planned distance must be a number').optional().isNumeric(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, message: 'Validation Error', errors: errors.array() });
    }
    next();
  },
];

const validateTripCompletion = [
  check('actualDistance', 'Actual distance must be a number').optional().isNumeric(),
  check('fuelUsed', 'Fuel used must be a number').optional().isNumeric(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, message: 'Validation Error', errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateTripCreation,
  validateTripCompletion,
};
