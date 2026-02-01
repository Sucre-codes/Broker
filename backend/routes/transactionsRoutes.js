const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTransactions,
  getTransaction
} = require('../controllers/transactionController');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getTransactions);

router.route('/:id')
  .get(getTransaction);

module.exports = router;
