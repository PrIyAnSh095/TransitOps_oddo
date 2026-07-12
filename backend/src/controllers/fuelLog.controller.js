const asyncHandler = require('express-async-handler');
const fuelLogService = require('../services/fuelLog.service');

// @desc    Get all fuel logs
// @route   GET /api/fuel-logs
// @access  Private
const getFuelLogs = asyncHandler(async (req, res) => {
  const logs = await fuelLogService.getAllFuelLogs();
  res.status(200).json({
    success: true,
    message: 'Fuel logs fetched successfully',
    data: logs,
  });
});

// @desc    Get fuel log by id
// @route   GET /api/fuel-logs/:id
// @access  Private
const getFuelLogById = asyncHandler(async (req, res) => {
  const log = await fuelLogService.getFuelLogById(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Fuel log fetched successfully',
    data: log,
  });
});

// @desc    Create a fuel log
// @route   POST /api/fuel-logs
// @access  Private
const createFuelLog = asyncHandler(async (req, res) => {
  const log = await fuelLogService.createFuelLog(req.body, req.user._id);
  res.status(201).json({
    success: true,
    message: 'Fuel log created successfully',
    data: log,
  });
});

module.exports = {
  getFuelLogs,
  getFuelLogById,
  createFuelLog,
};
