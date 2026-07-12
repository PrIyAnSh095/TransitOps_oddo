const express = require('express');
const router = express.Router();
const {
  getFuelLogs,
  getFuelLogById,
  createFuelLog,
} = require('../controllers/fuelLog.controller');
const { protect } = require('../middleware/auth');
const { globalLimiter } = require('../middleware/rateLimiter');

router.use(protect);
router.use(globalLimiter);

router.route('/')
  .get(getFuelLogs)
  .post(createFuelLog);

router.route('/:id')
  .get(getFuelLogById);

module.exports = router;
