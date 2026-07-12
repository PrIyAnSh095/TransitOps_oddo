const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getDrivers,
  getDriverSummary,
  createDriver,
  updateDriver,
  deleteDriver,
} = require('../controllers/driver.controller');

router.use(protect); // all driver routes require auth

router.get('/summary', getDriverSummary);
router.get('/', getDrivers);
router.post('/', createDriver);
router.put('/:id', updateDriver);
router.delete('/:id', deleteDriver);

module.exports = router;
