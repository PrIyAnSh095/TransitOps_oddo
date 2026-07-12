const asyncHandler = require('express-async-handler');
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Expense = require('../models/Expense');
const MaintenanceLog = require('../models/MaintananceLog');
const FuelLog = require('../models/FuelLog');
const { buildTimeSeriesPipeline, formatChartData } = require('../utils/analytics');

const getManagerKPIs = asyncHandler(async (req, res) => {
  const totalVehicles = await Vehicle.countDocuments({ isActive: true });
  const availableVehicles = await Vehicle.countDocuments({ isActive: true, status: 'AVAILABLE' });
  const activeTrips = await Trip.countDocuments({ status: 'DISPATCHED' });
  const driversOnDuty = await Driver.countDocuments({ isActive: true, status: 'ON_TRIP' });
  const vehiclesInMaintenance = await Vehicle.countDocuments({ isActive: true, status: 'IN_SHOP' });
  
  const fleetUtilization = totalVehicles > 0 ? ((totalVehicles - availableVehicles - vehiclesInMaintenance) / totalVehicles) * 100 : 0;
  
  const tripsResult = await Trip.aggregate([
    { $match: { status: 'COMPLETED' } },
    { $group: { _id: null, totalRevenue: { $sum: '$revenue' } } }
  ]);
  
  const monthlyRevenue = tripsResult[0] ? tripsResult[0].totalRevenue : 0;
  
  const expensesResult = await Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
  const maintenanceResult = await MaintenanceLog.aggregate([{ $group: { _id: null, total: { $sum: { $ifNull: ['$actualCost', '$estimatedCost'] } } } }]);
  const monthlyOperationalCost = (expensesResult[0] ? expensesResult[0].total : 0) + (maintenanceResult[0] ? maintenanceResult[0].total : 0);

  res.json({
    success: true,
    data: {
      totalVehicles,
      availableVehicles,
      activeTrips,
      driversOnDuty,
      vehiclesInMaintenance,
      fleetUtilization,
      monthlyRevenue,
      monthlyOperationalCost
    }
  });
});

const getFleetStatus = asyncHandler(async (req, res) => {
  const statusCounts = await Vehicle.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  const getColor = (s) => s === 'AVAILABLE' ? '#48ddbc' : s === 'ON_TRIP' ? '#558ded' : '#ff6b6b';
  
  res.json({
    success: true,
    data: statusCounts.map(s => ({
      name: s._id === 'AVAILABLE' ? 'Available' : s._id === 'ON_TRIP' ? 'On Trip' : 'In Shop',
      value: s.count,
      color: getColor(s._id)
    }))
  });
});

const getDriverStatus = asyncHandler(async (req, res) => {
  const statusCounts = await Driver.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  const getColor = (s) => s === 'AVAILABLE' ? '#48ddbc' : s === 'ON_TRIP' ? '#558ded' : '#8e9192';
  
  res.json({
    success: true,
    data: statusCounts.map(s => ({
      name: s._id === 'AVAILABLE' ? 'Available' : s._id === 'ON_TRIP' ? 'On Duty' : 'Off Duty',
      value: s.count,
      color: getColor(s._id)
    }))
  });
});

const getTripsTrend = asyncHandler(async (req, res) => {
  const query = { ...req.query, period: req.query.period || 'monthly' };
  const pipeline = buildTimeSeriesPipeline(query, 'dispatchTime');
  const results = await Trip.aggregate(pipeline);
  const data = formatChartData(results, query.period, { labelKey: 'name', valueKey: 'value', fromDate: query.fromDate, toDate: query.toDate });

  res.json({
    success: true,
    data
  });
});

const getFuelTrend = asyncHandler(async (req, res) => {
  const query = { ...req.query, period: req.query.period || 'monthly' };
  const pipeline = buildTimeSeriesPipeline(query, 'fuelDate', {}, '$cost');
  const results = await FuelLog.aggregate(pipeline);
  const data = formatChartData(results, query.period, { labelKey: 'name', valueKey: 'value', fromDate: query.fromDate, toDate: query.toDate });

  res.json({
    success: true,
    data
  });
});

const getCostBreakdown = asyncHandler(async (req, res) => {
  const expensesResult = await Expense.aggregate([
    { $group: { _id: '$expenseType', total: { $sum: '$amount' } } }
  ]);
  const maintenanceResult = await MaintenanceLog.aggregate([{ $group: { _id: null, total: { $sum: { $ifNull: ['$actualCost', '$estimatedCost'] } } } }]);

  const data = expensesResult.map(e => ({
    name: e._id,
    value: e.total,
    color: e._id === 'FUEL' ? '#558ded' : e._id === 'MAINTENANCE' ? '#ff6b6b' : '#ffc633'
  }));

  if (maintenanceResult.length > 0) {
    data.push({ name: 'Maintenance', value: maintenanceResult[0].total, color: '#48ddbc' });
  }

  res.json({ success: true, data });
});

const getRecentActivity = asyncHandler(async (req, res) => {
  const recentTrips = await Trip.find().sort({ createdAt: -1 }).limit(3).populate('vehicle');
  
  res.json({
    success: true,
    data: recentTrips.map(t => ({
      id: t._id.toString(),
      type: t.status === 'COMPLETED' ? 'Trip Completed' : 'Trip Created',
      description: `Trip ${t.tripNumber} ${t.status === 'COMPLETED' ? 'completed' : 'created'}`,
      timestamp: t.createdAt.toISOString()
    }))
  });
});

const getAlerts = asyncHandler(async (req, res) => {
  // Simple alerts based on expired drivers or in shop vehicles
  const expiredDrivers = await Driver.find({ licenseExpiry: { $lt: new Date() } }).limit(2);
  const data = expiredDrivers.map(d => ({
    id: d._id.toString(),
    type: 'License Expiry',
    message: `${d.firstName} ${d.lastName} license expired`,
    severity: 'high'
  }));

  res.json({ success: true, data });
});

const getAvailableVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ isActive: true, status: 'AVAILABLE' }).limit(5);
  res.json({
    success: true,
    data: vehicles.map(v => ({
      id: v._id.toString(),
      registrationNumber: v.registrationNumber,
      capacity: v.maxLoadCapacity,
      region: v.region,
      status: 'Available'
    }))
  });
});

const getAvailableDrivers = asyncHandler(async (req, res) => {
  const drivers = await Driver.find({ isActive: true, status: 'AVAILABLE' }).limit(5);
  res.json({
    success: true,
    data: drivers.map(d => ({
      id: d._id.toString(),
      name: `${d.firstName} ${d.lastName}`,
      status: 'Available'
    }))
  });
});

const getActiveTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find({ status: 'DISPATCHED' }).populate('vehicle driver').limit(5);
  res.json({
    success: true,
    data: trips.map(t => ({
      id: t._id.toString(),
      code: t.tripNumber || 'TR000',
      status: 'Dispatched',
      vehicle: t.vehicle ? t.vehicle.registrationNumber : 'Unknown',
      driver: t.driver ? `${t.driver.firstName} ${t.driver.lastName}` : 'Unknown',
      destination: t.destination
    }))
  });
});

const getDispatchSuggestions = asyncHandler(async (req, res) => {
  res.json({ success: true, data: [] });
});

const getRecentDispatchActivity = asyncHandler(async (req, res) => {
  res.json({ success: true, data: [] });
});

module.exports = {
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
};
