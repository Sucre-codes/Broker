/**
 * Admin Routes
 * Routes for admin operations (payment verification, user management)
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admincontroller');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect);
router.use(authorize());

// Investment management
router.get('/investments/pending', adminController.getPendingInvestments);

// Payment verification - Crypto
router.put('/payments/crypto/approve/:investmentId', adminController.approveCryptoPayment);
router.put('/payments/crypto/reject/:investmentId', adminController.rejectCryptoPayment);

// Payment verification - Wire Transfer
router.put('/payments/wire/approve/:investmentId', adminController.approveWireTransfer);
router.put('/payments/wire/reject/:investmentId', adminController.rejectWireTransfer);

// User management
router.get('/users', adminController.getAllUsers);

// Platform statistics
router.get('/stats', adminController.getPlatformStats);

module.exports = router;
