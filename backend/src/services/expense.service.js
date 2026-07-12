const expenseRepository = require('../repositories/expense.repository');
const vehicleRepository = require('../repositories/vehicle.repository');
const mongoose = require('mongoose');

class ExpenseService {
  async getAllExpenses() {
    return await expenseRepository.findAll();
  }

  async getExpenseById(id) {
    const expense = await expenseRepository.findById(id);
    if (!expense) {
      const error = new Error('Expense not found');
      error.statusCode = 404;
      throw error;
    }
    return expense;
  }

  async createExpense(data, userId) {
    // vehicleId is optional for expenses
    if (data.vehicle) {
      const vehicle = await vehicleRepository.findById(data.vehicle);
      if (!vehicle) {
        const error = new Error('Vehicle not found');
        error.statusCode = 404;
        throw error;
      }
    }

    const expenseData = {
      vehicle: data.vehicle || undefined,
      trip: mongoose.isValidObjectId(data.trip) ? data.trip : null,
      expenseType: data.expenseType || data.type,
      amount: data.amount,
      description: data.description,
      paymentMethod: data.paymentMethod,
      expenseDate: data.expenseDate || data.date || new Date(),
      metadata: { createdBy: userId },
    };

    return await expenseRepository.create(expenseData);
  }
}

module.exports = new ExpenseService();
