const maintenanceRepository = require('../repositories/maintenance.repository');
const vehicleRepository = require('../repositories/vehicle.repository');

const MaintenanceLog = require('../models/MaintananceLog');
const { buildTimeSeriesPipeline, formatChartData } = require('../utils/analytics');

class MaintenanceService {
  async getAllMaintenanceLogs(query = {}) {
    const { status, search, fromDate, toDate } = query;
    const match = {};

    if (status && status !== 'All') match.status = status.toUpperCase();
    if (fromDate || toDate) {
      match.createdAt = {};
      if (fromDate) match.createdAt.$gte = new Date(fromDate);
      if (toDate) match.createdAt.$lte = new Date(toDate);
    }
    
    // Simple regex search on type, description
    if (search) {
      match.$or = [
        { type: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    return await MaintenanceLog.find(match).populate('vehicle').sort({ createdAt: -1 });
  }

  async getMaintenanceSummary(query) {
    const pipeline = buildTimeSeriesPipeline(query, 'createdAt', {}, { $ifNull: ['$actualCost', '$estimatedCost'] });
    const results = await MaintenanceLog.aggregate(pipeline);
    const chartData = formatChartData(results, query.period || 'monthly');

    // Also get overall stats for the current filters
    const match = pipeline[0].$match;
    const statsResult = await MaintenanceLog.aggregate([
      { $match: match },
      { 
        $group: { 
          _id: null, 
          activeRepairs: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
          totalCost: { $sum: { $ifNull: ['$actualCost', '$estimatedCost'] } }
        } 
      }
    ]);

    const stats = statsResult[0] || { activeRepairs: 0, completed: 0, totalCost: 0 };

    return {
      chartData,
      stats: [
        { label: 'Active Repairs', value: stats.activeRepairs, color: '#ff6b6b' },
        { label: 'Completed', value: stats.completed, color: '#48ddbc' },
        { label: 'Total Cost', value: `$${(stats.totalCost || 0).toLocaleString()}`, color: '#ffc633' },
        { label: 'Avg Downtime', value: '2.5 Days' } // Hardcoded average for now
      ]
    };
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
