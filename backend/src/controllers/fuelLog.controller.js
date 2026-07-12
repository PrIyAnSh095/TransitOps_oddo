const asyncHandler = require('express-async-handler');
const FuelLog = require('../models/FuelLog');
const fuelLogService = require('../services/fuelLog.service');

// @desc    Get all fuel logs
// @route   GET /api/fuel-logs
// @access  Private
const getFuelLogs = asyncHandler(async (req, res) => {
  const fuelLogs = await FuelLog.find().populate('vehicle');
  
  // Format for frontend
  const formattedLogs = fuelLogs.map(f => ({
    id: f._id.toString(),
    vehicleId: f.vehicle ? f.vehicle._id.toString() : null,
    liters: f.litres,
    cost: f.cost,
    date: f.fuelDate || f.createdAt,
    location: f.station || 'Unknown',
    odometerReading: f.odometer
  }));
  
  res.json(formattedLogs);
});

// @desc    Get fuel log by id
// @route   GET /api/fuel-logs/:id
// @access  Private
const getFuelLogById = asyncHandler(async (req, res) => {
  const log = await fuelLogService.getFuelLogById(req.params.id);
  res.json(log);
});

// @desc    Create new fuel log
// @route   POST /api/fuel-logs
// @access  Private
const createFuelLog = asyncHandler(async (req, res) => {
  const fuelLog = await FuelLog.create({
    vehicle: req.body.vehicleId,
    litres: req.body.liters,
    cost: req.body.cost,
    fuelDate: req.body.date,
    station: req.body.location,
    odometer: req.body.odometerReading,
    metadata: { createdBy: req.user._id }
  });

  const f = await FuelLog.findById(fuelLog._id).populate('vehicle');
  
  res.status(201).json({
    id: f._id.toString(),
    vehicleId: f.vehicle ? f.vehicle._id.toString() : null,
    liters: f.litres,
    cost: f.cost,
    date: f.fuelDate || f.createdAt,
    location: f.station || 'Unknown',
    odometerReading: f.odometer
  });
});

module.exports = {
  getFuelLogs,
  getFuelLogById,
  createFuelLog
};
