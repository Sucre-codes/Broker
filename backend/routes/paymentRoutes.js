/**
 * Payment Routes
 * Defines all payment-related endpoints
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Stripe routes
router.post('/stripe/create-intent', protect, paymentController.createStripeIntent);

// Stripe webhook (must be BEFORE any body parsing middleware)
// This route receives raw body, configured in server.js
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), paymentController.handleStripeWebhook);

// PayPal routes
router.post('/paypal/create-order', protect, paymentController.createPayPalOrder);
router.post('/paypal/capture/:orderId', protect, paymentController.capturePayPalOrder);

// Cryptocurrency routes
router.get('/crypto/:currency', protect, paymentController.getCryptoDetails);
router.post('/crypto/submit', protect, paymentController.submitCryptoPayment);

// Wire transfer routes
router.get('/wire/details', protect, paymentController.getWireDetails);
router.post('/wire/submit', protect, paymentController.submitWireTransfer);

module.exports = router;
