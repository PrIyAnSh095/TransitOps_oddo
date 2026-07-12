const mongoose = require('mongoose');
const { Schema } = mongoose;

const tripSchema = new Schema(
  {
    tripNumber: {
      type: String,
      trim: true,
    },

    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
    },

    driver: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
    },

    source: {
      type: String,
      trim: true,
    },

    destination: {
      type: String,
      trim: true,
    },

    cargoType: {
      type: String,
      trim: true,
    },

    cargoWeight: {
      type: Number,
    },

    plannedDistance: {
      type: Number,
    },

    actualDistance: {
      type: Number,
    },

    estimatedDuration: {
      type: Number, // in minutes
    },

    actualDuration: {
      type: Number, // in minutes
    },

    startOdometer: {
      type: Number,
    },

    endOdometer: {
      type: Number,
    },

    revenue: {
      type: Number,
    },

    fuelUsed: {
      type: Number,
    },

    expense: {
      type: Number,
    },

    dispatchTime: {
      type: Date,
    },

    completionTime: {
      type: Date,
    },

    remarks: {
      type: String,
    },

    status: {
      type: String,
      enum: ['DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'],
      default: 'DRAFT',
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

const Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;