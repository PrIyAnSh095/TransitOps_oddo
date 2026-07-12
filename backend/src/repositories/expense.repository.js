const Expense = require('../models/Expense');

class ExpenseRepository {
  async findAll() {
    return await Expense.find().populate('vehicle').populate('trip').lean();
  }

  async findById(id) {
    return await Expense.findById(id).populate('vehicle').populate('trip');
  }

  async create(data) {
    const expense = new Expense(data);
    return await expense.save();
  }

  async update(id, data) {
    return await Expense.findByIdAndUpdate(id, data, { new: true });
  }
}

module.exports = new ExpenseRepository();
