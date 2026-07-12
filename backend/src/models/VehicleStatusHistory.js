const mongoose = require('mongoose');
const { Schema } = mongoose;

const vehicleStatusHistorySchema = new Schema(
  {
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
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
      required: true, // e.g., 'TRIP_DISPATCHED', 'MAINTENANCE_STARTED'
    },
    metadata: {
      createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
  },
  {
    timestamps: true,
  }
);

const VehicleStatusHistory = mongoose.model('VehicleStatusHistory', vehicleStatusHistorySchema);
module.exports = VehicleStatusHistory;
