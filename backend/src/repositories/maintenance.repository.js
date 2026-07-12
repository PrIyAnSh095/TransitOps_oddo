const MaintenanceLog = require('../models/MaintananceLog');

class MaintenanceRepository {
  async findAll() {
    return await MaintenanceLog.find().populate('vehicle').lean();
  }

  async findById(id) {
    return await MaintenanceLog.findById(id).populate('vehicle');
  }

  async create(data) {
    const log = new MaintenanceLog(data);
    return await log.save();
  }

  async update(id, data) {
    return await MaintenanceLog.findByIdAndUpdate(id, data, { new: true });
  }

  async save(logDocument) {
    return await logDocument.save();
  }
}

module.exports = new MaintenanceRepository();
