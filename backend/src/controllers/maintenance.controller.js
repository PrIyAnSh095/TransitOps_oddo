const asyncHandler = require('express-async-handler');
const maintenanceService = require('../services/maintenance.service');

// @desc    Get all maintenance logs
// @route   GET /api/maintenance
// @access  Private
const getMaintenanceLogs = asyncHandler(async (req, res) => {
  const logs = await maintenanceService.getAllMaintenanceLogs(req.query);
  res.status(200).json({
    success: true,
    message: 'Maintenance logs fetched successfully',
    data: logs
  });
});

const getMaintenanceSummary = asyncHandler(async (req, res) => {
  const summary = await maintenanceService.getMaintenanceSummary(req.query);
  res.status(200).json({
    success: true,
    data: summary
  });
});

// @desc    Get maintenance log by id
// @route   GET /api/maintenance/:id
// @access  Private
const getMaintenanceLogById = asyncHandler(async (req, res) => {
  const log = await maintenanceService.getMaintenanceLogById(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Maintenance log fetched successfully',
    data: log
  });
});

// @desc    Create a maintenance log
// @route   POST /api/maintenance
// @access  Private
const createMaintenanceLog = asyncHandler(async (req, res) => {
  const log = await maintenanceService.createMaintenanceLog(req.body, req.user._id);
  res.status(201).json({
    success: true,
    message: 'Maintenance log created successfully',
    data: log
  });
});

// @desc    Close a maintenance log
// @route   PATCH /api/maintenance/:id/close
// @access  Private
const closeMaintenanceLog = asyncHandler(async (req, res) => {
  const log = await maintenanceService.closeMaintenanceLog(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    message: 'Maintenance log closed successfully',
    data: log
  });
});


module.exports = {
  getMaintenanceLogs,
  getMaintenanceSummary,
  getMaintenanceLogById,
  createMaintenanceLog,
  closeMaintenanceLog
};
