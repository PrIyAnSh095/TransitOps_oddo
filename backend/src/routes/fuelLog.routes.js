const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getFuelLogs,
  getFuelLogById,
  createFuelLog
} = require('../controllers/fuelLog.controller');

router.use(protect);

router.route('/')
  .get(getFuelLogs)
  .post(createFuelLog);

router.route('/:id')
  .get(getFuelLogById);
module.exports = router;
