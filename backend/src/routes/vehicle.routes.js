const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getVehicles,
  getVehicleSummary,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicle.controller');

router.use(protect); // all vehicle routes require auth

router.get('/summary', getVehicleSummary);
router.get('/', getVehicles);
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

module.exports = router;
