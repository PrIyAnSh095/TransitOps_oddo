const FuelLog = require('../models/FuelLog');

class FuelLogRepository {
  async findAll() {
    return await FuelLog.find().populate('vehicle').populate('trip').lean();
  }

  async findById(id) {
    return await FuelLog.findById(id).populate('vehicle').populate('trip');
  }

  async create(data) {
    const log = new FuelLog(data);
    return await log.save();
  }

  async update(id, data) {
    return await FuelLog.findByIdAndUpdate(id, data, { new: true });
  }
}

module.exports = new FuelLogRepository();
