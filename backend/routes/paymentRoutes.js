/**
 * Payment Routes
 * Defines all payment-related endpoints
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');


router.post('/initiate',protect, paymentController.initiatePayment)


// Cryptocurrency routes
router.get('/crypto/:currency', protect, paymentController.getCryptoDetails);
router.post('/crypto/submit', protect, paymentController.submitCryptoPayment);

// Wire transfer routes
router.get('/wire/details', protect, paymentController.getWireDetails);
router.post('/wire/submit', protect, paymentController.submitWireTransfer);

module.exports = router;
