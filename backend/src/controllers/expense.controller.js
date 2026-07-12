const asyncHandler = require('express-async-handler');
const expenseService = require('../services/expense.service');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = asyncHandler(async (req, res) => {
  const expenses = await expenseService.getAllExpenses();
  res.status(200).json({
    success: true,
    message: 'Expenses fetched successfully',
    data: expenses,
  });
});

// @desc    Get expense by id
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await expenseService.getExpenseById(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Expense fetched successfully',
    data: expense,
  });
});

// @desc    Create an expense
// @route   POST /api/expenses
// @access  Private
const createExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.body, req.user._id);
  res.status(201).json({
    success: true,
    message: 'Expense created successfully',
    data: expense,
  });
});

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
};
