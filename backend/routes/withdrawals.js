const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  requestWithdrawal,
  getWithdrawals,
  getWithdrawal
} = require('../controllers/WithdrawalController');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getWithdrawals)
  .post(requestWithdrawal);

router.route('/:id')
  .get(getWithdrawal);

module.exports = router;
