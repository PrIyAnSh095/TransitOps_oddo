const Trip = require('../models/Trip');

class TripRepository {
  async findAll() {
    return await Trip.find().populate('vehicle').populate('driver').lean();
  }

  async findById(id) {
    return await Trip.findById(id).populate('vehicle').populate('driver');
  }

  async create(data) {
    const trip = new Trip(data);
    return await trip.save();
  }

  async update(id, data) {
    return await Trip.findByIdAndUpdate(id, data, { new: true });
  }

  async save(tripDocument) {
    return await tripDocument.save();
  }
}

module.exports = new TripRepository();
