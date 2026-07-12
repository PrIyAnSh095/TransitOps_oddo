const { check, validationResult } = require('express-validator');

const validateMaintenanceCreation = [
  check('vehicle', 'Vehicle ID is required').notEmpty().isMongoId(),
  check('maintenanceType', 'Maintenance type is required').notEmpty(),
  check('description', 'Description is required').notEmpty(),
  check('estimatedCost', 'Estimated cost must be a number').optional().isNumeric(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, message: 'Validation Error', errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateMaintenanceCreation,
};
