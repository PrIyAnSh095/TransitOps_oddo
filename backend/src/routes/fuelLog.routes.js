const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getFuelLogs,
  createFuelLog
} = require('../controllers/fuelLog.controller');

router.use(protect);

router.route('/')
  .get(getFuelLogs)
  .post(createFuelLog);

module.exports = router;
