const tripRepository = require('../repositories/trip.repository');
const vehicleRepository = require('../repositories/vehicle.repository');
const driverRepository = require('../repositories/driver.repository');

class TripService {
  async getAllTrips() {
    return await tripRepository.findAll();
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
