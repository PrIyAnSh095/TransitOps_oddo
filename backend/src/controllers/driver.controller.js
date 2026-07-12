const asyncHandler = require('express-async-handler');
const Driver = require('../models/Driver');

/**
 * Map a Mongoose Driver document to the frontend Driver shape.
 * The DB stores firstName + lastName; the frontend uses a single `name` field.
 */
function toClientDriver(doc) {
  return {
    id: doc._id.toString(),
    name: `${doc.firstName} ${doc.lastName}`.trim(),
    licenseNumber: doc.licenseNumber || '',
    licenseCategory: doc.licenseCategory || '',
    licenseExpiryDate: doc.licenseExpiry ? doc.licenseExpiry.toISOString() : new Date().toISOString(),
    contactNumber: doc.phone || '',
    safetyScore: doc.safetyScore ?? 100,
    status: mapStatusToClient(doc.status),
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString(),
  };
}

function mapStatusToClient(status) {
  const map = {
    REGISTERED: 'Available',
    AVAILABLE: 'Available',
    ON_TRIP: 'On Trip',
    OFF_DUTY: 'Off Duty',
    SUSPENDED: 'Suspended',
  };
  return map[status] || 'Available';
}

function mapStatusToDb(status) {
  const map = {
    Available: 'AVAILABLE',
    'On Trip': 'ON_TRIP',
    'Off Duty': 'OFF_DUTY',
    Suspended: 'SUSPENDED',
  };
  return map[status] || 'AVAILABLE';
}

/**
 * Split a full name string into firstName + lastName.
 * Everything after the first space is considered the last name.
 */
function splitName(fullName = '') {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || 'Unknown';
  const lastName = parts.slice(1).join(' ') || '-';
  return { firstName, lastName };
}

const { buildTimeSeriesPipeline, formatChartData } = require('../utils/analytics');

// @desc  Get all drivers
// @route GET /api/drivers
// @access Private
const getDrivers = asyncHandler(async (req, res) => {
  const { status, search, fromDate, toDate } = req.query;
  const match = { isActive: true };

  if (status && status !== 'All') {
    match.status = mapStatusToDb(status);
  }

  if (fromDate || toDate) {
    match.createdAt = {};
    if (fromDate) match.createdAt.$gte = new Date(fromDate);
    if (toDate) match.createdAt.$lte = new Date(toDate);
  }

  if (search) {
    match.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { licenseNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const drivers = await Driver.find(match).sort({ createdAt: -1 });
  res.json({
    success: true,
    data: drivers.map(toClientDriver)
  });
});

const getDriverSummary = asyncHandler(async (req, res) => {
  const pipeline = buildTimeSeriesPipeline(req.query, 'createdAt');
  const results = await Driver.aggregate(pipeline);
  const chartData = formatChartData(results, req.query.period || 'monthly');

  // Overall Stats
  const match = pipeline[0].$match;
  const statsResult = await Driver.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        available: { $sum: { $cond: [{ $eq: ['$status', 'AVAILABLE'] }, 1, 0] } },
        onDuty: { $sum: { $cond: [{ $eq: ['$status', 'ON_TRIP'] }, 1, 0] } },
        avgSafetyScore: { $avg: '$safetyScore' }
      }
    }
  ]);

  const stats = statsResult[0] || { total: 0, available: 0, onDuty: 0, avgSafetyScore: 0 };

  res.json({
    success: true,
    data: {
      chartData,
      stats: [
        { label: 'Total Drivers', value: stats.total },
        { label: 'On Duty', value: stats.onDuty, color: '#558ded' },
        { label: 'Available', value: stats.available, color: '#48ddbc' },
        { label: 'Avg Safety Score', value: `${Math.round(stats.avgSafetyScore || 0)}%` }
      ]
    }
  });
});

// @desc  Create a driver
// @route POST /api/drivers
// @access Private
const createDriver = asyncHandler(async (req, res) => {
  const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber } = req.body;

  // Check for duplicate license number
  if (licenseNumber) {
    const existing = await Driver.findOne({
      licenseNumber: licenseNumber.toUpperCase(),
      isActive: true,
    });
    if (existing) {
      res.status(400);
      throw new Error('A driver with this license number already exists.');
    }
  }

  const { firstName, lastName } = splitName(name);

  const driver = await Driver.create({
    firstName,
    lastName,
    licenseNumber: licenseNumber ? licenseNumber.toUpperCase() : undefined,
    licenseCategory,
    licenseExpiry: licenseExpiryDate ? new Date(licenseExpiryDate) : undefined,
    phone: contactNumber,
    status: 'AVAILABLE',
    isActive: true,
    metadata: {
      createdBy: req.user?._id,
      source: 'manual',
    },
  });

  res.status(201).json(toClientDriver(driver));
});

// @desc  Update a driver
// @route PUT /api/drivers/:id
// @access Private
const updateDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id);

  if (!driver) {
    res.status(404);
    throw new Error('Driver not found');
  }

  const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, status } = req.body;

  if (name !== undefined) {
    const { firstName, lastName } = splitName(name);
    driver.firstName = firstName;
    driver.lastName = lastName;
  }
  if (licenseNumber !== undefined) driver.licenseNumber = licenseNumber.toUpperCase();
  if (licenseCategory !== undefined) driver.licenseCategory = licenseCategory;
  if (licenseExpiryDate !== undefined) driver.licenseExpiry = new Date(licenseExpiryDate);
  if (contactNumber !== undefined) driver.phone = contactNumber;
  if (status !== undefined) driver.status = mapStatusToDb(status);

  if (req.user?._id) {
    driver.metadata = { ...driver.metadata?.toObject?.() ?? driver.metadata, updatedBy: req.user._id };
  }

  const updated = await driver.save();
  res.json(toClientDriver(updated));
});

// @desc  Soft-delete a driver
// @route DELETE /api/drivers/:id
// @access Private
const deleteDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id);

  if (!driver) {
    res.status(404);
    throw new Error('Driver not found');
  }

  driver.isActive = false;
  driver.status = 'SUSPENDED';
  await driver.save();

  res.status(204).send();
});

module.exports = { getDrivers, getDriverSummary, createDriver, updateDriver, deleteDriver };
