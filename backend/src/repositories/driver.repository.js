const Driver = require('../models/Driver');
const DriverStatusHistory = require('../models/DriverStatusHistory');

class DriverRepository {
  async findById(id) {
    return await Driver.findById(id);
  }

  async updateStatus(id, newStatus, reason, userId) {
    const driver = await Driver.findById(id);
    if (!driver) throw new Error('Driver not found');

    const previousStatus = driver.status;
    driver.status = newStatus;
    await driver.save();

    await DriverStatusHistory.create({
      driver: id,
      previousStatus,
      newStatus,
      reason,
      metadata: { createdBy: userId }
    });

    return driver;
  }
}

module.exports = new DriverRepository();
