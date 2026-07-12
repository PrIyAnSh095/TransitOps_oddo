const express = require('express');
const router = express.Router();
const {
  getMaintenanceLogs,
  getMaintenanceLogById,
  createMaintenanceLog,
  closeMaintenanceLog
} = require('../controllers/maintenance.controller');
const { protect } = require('../middleware/auth');
const { globalLimiter } = require('../middleware/rateLimiter');
const { validateMaintenanceCreation } = require('../validators/maintenance.validator');

router.use(protect);
router.use(globalLimiter);

router.route('/')
  .get(getMaintenanceLogs)
  .post(validateMaintenanceCreation, createMaintenanceLog);

router.route('/:id')
  .get(getMaintenanceLogById);

router.route('/:id/close')
  .patch(closeMaintenanceLog)
  .put(closeMaintenanceLog); // Added PUT to map to frontend

module.exports = router;
