const fuelLogRepository = require('../repositories/fuelLog.repository');
const vehicleRepository = require('../repositories/vehicle.repository');
const mongoose = require('mongoose');

class FuelLogService {
  async getAllFuelLogs() {
    return await fuelLogRepository.findAll();
  }

  async getFuelLogById(id) {
    const log = await fuelLogRepository.findById(id);
    if (!log) {
      const error = new Error('Fuel log not found');
      error.statusCode = 404;
      throw error;
    }
    return log;
  }

  async createFuelLog(data, userId) {
    // Verify vehicle exists
    const vehicle = await vehicleRepository.findById(data.vehicle);
    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    const logData = {
      vehicle: data.vehicle,
      trip: mongoose.isValidObjectId(data.trip) ? data.trip : null,
      litres: data.litres,
      cost: data.cost,
      pricePerLitre: data.pricePerLitre,
      odometer: data.odometer,
      station: data.station,
      paymentMethod: data.paymentMethod,
      fuelDate: data.fuelDate || data.date || new Date(),
      remarks: data.remarks,
      metadata: { createdBy: userId },
    };

    return await fuelLogRepository.create(logData);
  }
}

module.exports = new FuelLogService();
