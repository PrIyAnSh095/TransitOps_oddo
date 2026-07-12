const mongoose = require('mongoose');
const { Schema } = mongoose;

const driverStatusHistorySchema = new Schema(
  {
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    previousStatus: {
      type: String,
      required: true,
    },
    newStatus: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true, // e.g., 'TRIP_DISPATCHED', 'TRIP_COMPLETED'
    },
    metadata: {
      createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
  },
  {
    timestamps: true,
  }
);

const DriverStatusHistory = mongoose.model('DriverStatusHistory', driverStatusHistorySchema);
module.exports = DriverStatusHistory;
