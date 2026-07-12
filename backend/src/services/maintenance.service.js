const maintenanceRepository = require('../repositories/maintenance.repository');
const vehicleRepository = require('../repositories/vehicle.repository');

class MaintenanceService {
  async getAllMaintenanceLogs() {
    return await maintenanceRepository.findAll();
  }

  async getMaintenanceLogById(id) {
    const log = await maintenanceRepository.findById(id);
    if (!log) {
      const error = new Error('Maintenance log not found');
      error.statusCode = 404;
      throw error;
    }
    return log;
  }

  async createMaintenanceLog(data, userId) {
    // Verify Vehicle exists and is AVAILABLE
    const vehicle = await vehicleRepository.findById(data.vehicle);
    if (!vehicle) {
      const error = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    if (vehicle.status === 'RETIRED') {
      const error = new Error('Retired vehicles cannot enter maintenance');
      error.statusCode = 422;
      throw error;
    }

    if (vehicle.status !== 'AVAILABLE') {
      const error = new Error('Vehicle must be AVAILABLE to enter maintenance');
      error.statusCode = 422;
      throw error;
    }

    // Update Vehicle to IN_SHOP
    await vehicleRepository.updateStatus(data.vehicle, 'IN_SHOP', 'MAINTENANCE_STARTED', userId);

    // Create Maintenance Log
    const logData = {
      ...data,
      status: 'ACTIVE',
      metadata: { createdBy: userId }
    };

    return await maintenanceRepository.create(logData);
  }

  async closeMaintenanceLog(id, userId) {
    const log = await this.getMaintenanceLogById(id);

    if (log.status !== 'ACTIVE') {
      const error = new Error('Only ACTIVE maintenance logs can be closed');
      error.statusCode = 422;
      throw error;
    }

    // Check vehicle status
    const vehicle = await vehicleRepository.findById(log.vehicle);
    if (vehicle && vehicle.status === 'IN_SHOP') {
      await vehicleRepository.updateStatus(log.vehicle, 'AVAILABLE', 'MAINTENANCE_COMPLETED', userId);
    }

    log.status = 'COMPLETED';
    log.completionDate = new Date();
    log.metadata = { ...log.metadata, updatedBy: userId };

    return await maintenanceRepository.save(log);
  }
}

module.exports = new MaintenanceService();
