const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createInvestment,
  getInvestments,
  getInvestment,
  getDashboardStats,
  calculateInvestment
} = require('../controllers/investmentController');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getInvestments)
  .post(createInvestment);

router.post('/calculate', calculateInvestment);
router.get('/dashboard/stats', getDashboardStats);

router.route('/:id')
  .get(getInvestment);

module.exports = router;
