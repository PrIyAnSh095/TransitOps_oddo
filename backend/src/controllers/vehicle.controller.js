const asyncHandler = require('express-async-handler');
const Vehicle = require('../models/Vehicle');

/**
 * Map a Mongoose Vehicle document to the frontend Vehicle shape.
 */
function toClientVehicle(doc) {
  return {
    id: doc._id.toString(),
    registrationNumber: doc.registrationNumber,
    name: doc.vehicleName || '',
    type: doc.vehicleType
      ? doc.vehicleType.charAt(0).toUpperCase() + doc.vehicleType.slice(1).toLowerCase().replace(/_/g, ' ')
      : '',
    maxLoadCapacityKg: doc.maxLoadCapacity ?? 0,
    odometerKm: doc.currentOdometer ?? 0,
    acquisitionCost: doc.acquisitionCost ?? 0,
    region: doc.region || '',
    documents: [],
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
    IN_SHOP: 'In Shop',
    RETIRED: 'Retired',
  };
  return map[status] || 'Available';
}

function mapStatusToDb(status) {
  const map = {
    Available: 'AVAILABLE',
    'On Trip': 'ON_TRIP',
    'In Shop': 'IN_SHOP',
    Retired: 'RETIRED',
  };
  return map[status] || 'AVAILABLE';
}

function mapTypeToDb(type) {
  const map = {
    Van: 'VAN',
    Truck: 'TRUCK',
    Mini: 'MINI_TRUCK',
  };
  return map[type] || type.toUpperCase();
}

// @desc  Get all vehicles
// @route GET /api/vehicles
// @access Private
const getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ isActive: true }).sort({ createdAt: -1 });
  res.json(vehicles.map(toClientVehicle));
});

// @desc  Create a vehicle
// @route POST /api/vehicles
// @access Private
const createVehicle = asyncHandler(async (req, res) => {
  const {
    registrationNumber,
    name,
    type,
    maxLoadCapacityKg,
    odometerKm,
    acquisitionCost,
    region,
    documents,
  } = req.body;

  // Check for duplicate registration number
  const existing = await Vehicle.findOne({ registrationNumber: registrationNumber?.toUpperCase?.() ?? registrationNumber });
  if (existing) {
    res.status(400);
    throw new Error('A vehicle with this registration number already exists.');
  }

  const vehicle = await Vehicle.create({
    registrationNumber: registrationNumber?.toUpperCase?.() ?? registrationNumber,
    vehicleName: name,
    vehicleType: mapTypeToDb(type),
    maxLoadCapacity: maxLoadCapacityKg,
    currentOdometer: odometerKm,
    acquisitionCost,
    region,
    status: 'AVAILABLE',
    isActive: true,
    metadata: {
      createdBy: req.user?._id,
      source: 'manual',
    },
  });

  res.status(201).json(toClientVehicle(vehicle));
});

// @desc  Update a vehicle
// @route PUT /api/vehicles/:id
// @access Private
const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  const {
    registrationNumber,
    name,
    type,
    maxLoadCapacityKg,
    odometerKm,
    acquisitionCost,
    region,
    status,
  } = req.body;

  if (registrationNumber !== undefined) vehicle.registrationNumber = registrationNumber.toUpperCase?.() ?? registrationNumber;
  if (name !== undefined) vehicle.vehicleName = name;
  if (type !== undefined) vehicle.vehicleType = mapTypeToDb(type);
  if (maxLoadCapacityKg !== undefined) vehicle.maxLoadCapacity = maxLoadCapacityKg;
  if (odometerKm !== undefined) vehicle.currentOdometer = odometerKm;
  if (acquisitionCost !== undefined) vehicle.acquisitionCost = acquisitionCost;
  if (region !== undefined) vehicle.region = region;
  if (status !== undefined) vehicle.status = mapStatusToDb(status);

  if (req.user?._id) {
    vehicle.metadata = { ...vehicle.metadata, updatedBy: req.user._id };
  }

  const updated = await vehicle.save();
  res.json(toClientVehicle(updated));
});

// @desc  Delete (soft-delete) a vehicle
// @route DELETE /api/vehicles/:id
// @access Private
const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  vehicle.isActive = false;
  vehicle.status = 'RETIRED';
  await vehicle.save();

  res.status(204).send();
});

module.exports = { getVehicles, createVehicle, updateVehicle, deleteVehicle };
