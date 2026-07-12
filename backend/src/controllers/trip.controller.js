const asyncHandler = require('express-async-handler');
const tripService = require('../services/trip.service');

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private
const getTrips = asyncHandler(async (req, res) => {
  const trips = await tripService.getAllTrips(req.query);
  res.status(200).json({
    success: true,
    message: 'Trips fetched successfully',
    data: trips
  });
});

const getTripSummary = asyncHandler(async (req, res) => {
  const summary = await tripService.getTripSummary(req.query);
  res.status(200).json({
    success: true,
    data: summary
  });
});

// @desc    Get trip by id
// @route   GET /api/trips/:id
// @access  Private
const getTripById = asyncHandler(async (req, res) => {
  const trip = await tripService.getTripById(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Trip fetched successfully',
    data: trip
  });
});

// @desc    Create a trip
// @route   POST /api/trips
// @access  Private
const createTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.createTrip(req.body, req.user._id);
  res.status(201).json({
    success: true,
    message: 'Trip created successfully',
    data: trip
  });
});

// @desc    Dispatch a trip
// @route   PATCH /api/trips/:id/dispatch
// @access  Private
const dispatchTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.dispatchTrip(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    message: 'Trip dispatched successfully',
    data: trip
  });
});

// @desc    Complete a trip
// @route   PATCH /api/trips/:id/complete
// @access  Private
const completeTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.completeTrip(req.params.id, req.body, req.user._id);
  res.status(200).json({
    success: true,
    message: 'Trip completed successfully',
    data: trip
  });
});

// @desc    Cancel a trip
// @route   PATCH /api/trips/:id/cancel
// @access  Private
const cancelTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.cancelTrip(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    message: 'Trip cancelled successfully',
    data: trip
  });
});


module.exports = {
  getTrips,
  getTripSummary,
  getTripById,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip
};
