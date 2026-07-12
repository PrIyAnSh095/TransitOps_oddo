const Vehicle = require('../models/Vehicle');
const VehicleStatusHistory = require('../models/VehicleStatusHistory');

class VehicleRepository {
  async findById(id) {
    return await Vehicle.findById(id);
  }

  async updateStatus(id, newStatus, reason, userId) {
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) throw new Error('Vehicle not found');

    const previousStatus = vehicle.status;
    vehicle.status = newStatus;
    await vehicle.save();

    await VehicleStatusHistory.create({
      vehicle: id,
      previousStatus,
      newStatus,
      reason,
      metadata: { createdBy: userId }
    });

    return vehicle;
  }

  async updateOdometer(id, actualDistanceKm) {
    const vehicle = await Vehicle.findById(id);
    if (vehicle) {
      vehicle.odometer = (vehicle.odometer || 0) + actualDistanceKm;
      await vehicle.save();
    }
  }
}

module.exports = new VehicleRepository();
