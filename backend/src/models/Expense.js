const mongoose = require('mongoose');
const { Schema } = mongoose;

const expenseSchema = new Schema(
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

    expenseType: {
      type: String,
      enum: ['FUEL', 'MAINTENANCE', 'TOLL', 'PARKING', 'INSURANCE', 'FINE', 'OTHER'],
    },

    amount: {
      type: Number,
    },

    description: {
      type: String,
      trim: true,
    },

    paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'OTHER'],
    },

    expenseDate: {
      type: Date,
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

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;