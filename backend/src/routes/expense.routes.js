const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getExpenses,
  getExpenseSummary,
  createExpense
} = require('../controllers/expense.controller');

router.use(protect);

router.get('/summary', getExpenseSummary);
router.get('/', getExpenses);
router.post('/', createExpense);

module.exports = router;
