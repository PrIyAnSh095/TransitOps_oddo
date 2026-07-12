const mongoose = require('mongoose');
const { Schema } = mongoose;

const fuelLogSchema = new Schema(
  {
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },

    trip: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
    },

    litres: {
      type: Number,
    },

    cost: {
      type: Number,
    },

    pricePerLitre: {
      type: Number,
    },

    odometer: {
      type: Number,
    },

    station: {
      type: String,
      trim: true,
    },

    paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'OTHER'],
    },

    fuelDate: {
      type: Date,
    },

    remarks: {
      type: String,
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

const FuelLog = mongoose.model('FuelLog', fuelLogSchema);
module.exports = FuelLog;