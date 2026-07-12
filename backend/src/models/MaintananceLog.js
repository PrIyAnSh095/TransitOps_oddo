const mongoose = require('mongoose');
const { Schema } = mongoose;

const maintenanceLogSchema = new Schema(
  {
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },

    maintenanceType: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    vendor: {
      type: String,
      trim: true,
    },

    estimatedCost: {
      type: Number,
    },

    actualCost: {
      type: Number,
    },

    startDate: {
      type: Date,
    },

    completionDate: {
      type: Date,
    },

    nextServiceDue: {
      type: Date,
    },

    notes: {
      type: String,
    },

    status: {
      type: String,
      enum: ['SCHEDULED', 'ACTIVE', 'COMPLETED'],
      default: 'SCHEDULED',
    },

    metadata: {
      createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
      updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      source: { type: String },
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

const MaintenanceLog = mongoose.model('MaintenanceLog', maintenanceLogSchema);
module.exports = MaintenanceLog;