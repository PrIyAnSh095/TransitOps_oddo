const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getExpenses,
  getExpenseSummary,
  getExpenseById,
  createExpense
} = require('../controllers/expense.controller');

router.use(protect);

router.get('/summary', getExpenseSummary);
router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/:id')
  .get(getExpenseById);

module.exports = router;
