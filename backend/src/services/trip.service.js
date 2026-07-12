const tripRepository = require('../repositories/trip.repository');
const vehicleRepository = require('../repositories/vehicle.repository');
const driverRepository = require('../repositories/driver.repository');

const Trip = require('../models/Trip');
const { buildTimeSeriesPipeline, formatChartData } = require('../utils/analytics');

class TripService {
  async getAllTrips(query = {}) {
    const { status, search, fromDate, toDate } = query;
    const match = {};

    if (status && status !== 'All') match.status = status.toUpperCase();
    if (fromDate || toDate) {
      match.createdAt = {};
      if (fromDate) match.createdAt.$gte = new Date(fromDate);
      if (toDate) match.createdAt.$lte = new Date(toDate);
    }
    
    // Simple regex search on tripCode, source, destination
    if (search) {
      match.$or = [
        { tripNumber: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } }
      ];
    }

    return await Trip.find(match).populate('vehicle driver').sort({ createdAt: -1 });
  }

  async getTripSummary(query) {
    const pipeline = buildTimeSeriesPipeline(query, 'createdAt');
    const results = await Trip.aggregate(pipeline);
    const chartData = formatChartData(results, query.period || 'monthly');

    // Also get overall stats for the current filters
    const match = pipeline[0].$match;
    const statsResult = await Trip.aggregate([
      { $match: match },
      { 
        $group: { 
          _id: null, 
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] } },
          avgDistance: { $avg: '$actualDistance' }
        } 
      }
    ]);

    const stats = statsResult[0] || { total: 0, completed: 0, cancelled: 0, avgDistance: 0 };

    return {
      chartData,
      stats: [
        { label: 'Total Trips', value: stats.total },
        { label: 'Completed', value: stats.completed, color: '#48ddbc' },
        { label: 'Cancelled', value: stats.cancelled, color: '#ff6b6b' },
        { label: 'Avg Distance', value: `${(stats.avgDistance || 0).toFixed(1)} km` }
      ]
    };
  }

  async getTripById(id) {
    const trip = await tripRepository.findById(id);
    if (!trip) {
      const error = new Error('Trip not found');
      error.statusCode = 404;
      throw error;
    }
    return trip;
  }

  async createTrip(data, userId) {
    // 1. Verify Vehicle exists and is AVAILABLE
    const vehicle = await vehicleRepository.findById(data.vehicle);
    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }
    if (vehicle.status !== 'AVAILABLE') {
      const error = new Error('Vehicle is not available for a new trip');
      error.statusCode = 422;
      throw error;
    }
    if (data.cargoWeight && vehicle.capacity && data.cargoWeight > vehicle.capacity) {
      const error = new Error('Cargo weight exceeds vehicle capacity');
      error.statusCode = 422;
      throw error;
    }

    // 2. Verify Driver exists and is AVAILABLE
    const driver = await driverRepository.findById(data.driver);
    if (!driver) {
      const error = new Error('Driver not found');
      error.statusCode = 404;
      throw error;
    }
    if (driver.status !== 'AVAILABLE') {
      const error = new Error('Driver is not available for a new trip');
      error.statusCode = 422;
      throw error;
    }
    
    // Check if license is expired
    if (driver.licenseExpiry && new Date(driver.licenseExpiry) < new Date()) {
      const error = new Error('Driver license has expired');
      error.statusCode = 422;
      throw error;
    }

    // 3. Create trip in DRAFT status
    const tripData = {
      ...data,
      status: 'DRAFT',
      metadata: { createdBy: userId }
    };

    return await tripRepository.create(tripData);
  }

  async dispatchTrip(id, userId) {
    const trip = await this.getTripById(id);
    
    if (trip.status !== 'DRAFT') {
      const error = new Error('Only DRAFT trips can be dispatched');
      error.statusCode = 422;
      throw error;
    }

    // Check status again right before dispatch to avoid race conditions
    const vehicle = await vehicleRepository.findById(trip.vehicle);
    const driver = await driverRepository.findById(trip.driver);

    if (vehicle.status !== 'AVAILABLE' || driver.status !== 'AVAILABLE') {
      const error = new Error('Vehicle or Driver is no longer available');
      error.statusCode = 409;
      throw error;
    }

    // Update statuses
    await vehicleRepository.updateStatus(trip.vehicle, 'ON_TRIP', 'TRIP_DISPATCHED', userId);
    await driverRepository.updateStatus(trip.driver, 'ON_TRIP', 'TRIP_DISPATCHED', userId);

    trip.status = 'DISPATCHED';
    trip.dispatchTime = new Date();
    trip.metadata = { ...trip.metadata, updatedBy: userId };

    return await tripRepository.save(trip);
  }

  async completeTrip(id, { actualDistance, fuelUsed }, userId) {
    const trip = await this.getTripById(id);

    if (trip.status !== 'DISPATCHED') {
      const error = new Error('Only DISPATCHED trips can be completed');
      error.statusCode = 422;
      throw error;
    }

    // Update statuses
    await vehicleRepository.updateStatus(trip.vehicle, 'AVAILABLE', 'TRIP_COMPLETED', userId);
    await driverRepository.updateStatus(trip.driver, 'AVAILABLE', 'TRIP_COMPLETED', userId);

    // Update Odometer
    if (actualDistance) {
      await vehicleRepository.updateOdometer(trip.vehicle, actualDistance);
    }

    trip.status = 'COMPLETED';
    trip.completionTime = new Date();
    if (actualDistance) trip.actualDistance = actualDistance;
    if (fuelUsed) trip.fuelUsed = fuelUsed;
    trip.metadata = { ...trip.metadata, updatedBy: userId };

    return await tripRepository.save(trip);
  }

  async cancelTrip(id, userId) {
    const trip = await this.getTripById(id);

    if (!['DRAFT', 'DISPATCHED'].includes(trip.status)) {
      const error = new Error('Only DRAFT or DISPATCHED trips can be cancelled');
      error.statusCode = 422;
      throw error;
    }

    if (trip.status === 'DISPATCHED') {
      // Revert statuses
      await vehicleRepository.updateStatus(trip.vehicle, 'AVAILABLE', 'TRIP_CANCELLED', userId);
      await driverRepository.updateStatus(trip.driver, 'AVAILABLE', 'TRIP_CANCELLED', userId);
    }

    trip.status = 'CANCELLED';
    trip.metadata = { ...trip.metadata, updatedBy: userId };

    return await tripRepository.save(trip);
  }
}

module.exports = new TripService();
