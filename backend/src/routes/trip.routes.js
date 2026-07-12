const express = require('express');
const router = express.Router();
const {
  getTrips,
  getTripById,
  getTripSummary,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip
} = require('../controllers/trip.controller');
const { protect } = require('../middleware/auth');
const { globalLimiter } = require('../middleware/rateLimiter');
const { validateTripCreation, validateTripCompletion } = require('../validators/trip.validator');

router.use(protect);
router.use(globalLimiter);

router.route('/summary')
  .get(getTripSummary);

router.route('/')
  .get(getTrips)
  .post(validateTripCreation, createTrip);

router.route('/:id')
  .get(getTripById);

router.route('/:id/dispatch')
  .patch(dispatchTrip)
  .put(dispatchTrip); // Added PUT to map to frontend

router.route('/:id/complete')
  .patch(validateTripCompletion, completeTrip)
  .put(validateTripCompletion, completeTrip); // Added PUT to map to frontend

router.route('/:id/cancel')
  .patch(cancelTrip)
  .put(cancelTrip); // Added PUT to map to frontend

module.exports = router;
