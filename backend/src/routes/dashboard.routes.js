const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getManagerKPIs,
  getFleetStatus,
  getDriverStatus,
  getTripsTrend,
  getFuelTrend,
  getCostBreakdown,
  getRecentActivity,
  getAlerts,
  getAvailableVehicles,
  getAvailableDrivers,
  getActiveTrips,
  getDispatchSuggestions,
  getRecentDispatchActivity
} = require('../controllers/dashboard.controller');

router.use(protect);

router.get('/kpis', getManagerKPIs);
router.get('/fleet-status', getFleetStatus);
router.get('/driver-status', getDriverStatus);
router.get('/trips-trend', getTripsTrend);
router.get('/fuel-trend', getFuelTrend);
router.get('/cost-breakdown', getCostBreakdown);
router.get('/recent-activity', getRecentActivity);
router.get('/alerts', getAlerts);

router.get('/available-vehicles', getAvailableVehicles);
router.get('/available-drivers', getAvailableDrivers);
router.get('/active-trips', getActiveTrips);
router.get('/dispatch-suggestions', getDispatchSuggestions);
router.get('/recent-dispatch-activity', getRecentDispatchActivity);

module.exports = router;
