/**
 * Admin Controller
 * Handles admin operations: payment verification, payment-detail dispatch, user & stats management
 */

const Investment    = require('../models/Investment');
const Transaction   = require('../models/Transaction');
const User          = require('../models/User');
const emailService  = require('../services/emailService');
const { emitPaymentDetails, emitInvestmentUpdate } = require('../services/socketService');

// ===========================================================================
// NEW — Send payment details to a waiting user
//
// The admin fills in the payment details on their dashboard and hits "Send".
// This endpoint:
//   1. Validates the investment is in the correct state
//   2. Saves the details the admin entered onto the investment doc
//        (so we have a record, and in case the socket misses)
//   3. Emits via Socket.io → user sees them instantly
//   4. Sends a backup email with the same details
//
// @route   POST /api/admin/payments/send-details/:investmentId
// @access  Private/Admin
// @body    {
//            paymentMethod: 'crypto' | 'wire',
//            // crypto fields:
//            cryptoAddress, cryptoNetwork, cryptoCurrency, cryptoAmount,
//            // wire fields:
//            bankName, accountName, accountNumber, routingNumber, swiftCode, bankAddress, referenceNote,
//            // shared:
//            instructions: []
//          }
// ===========================================================================
exports.sendPaymentDetails = async (req, res) => {
  try {
    const { investmentId } = req.params;
    const details          = req.body;

    // --- fetch & guard -----------------------------------------------------
    const investment = await Investment.findById(investmentId).populate('user');
    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment not found' });
    }

    if (investment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Investment is not in pending state — cannot send details',
      });
    }

    // --- persist the details the admin entered (audit trail) ----------------
    investment.adminDetails = {
      ...details,
      sentAt:   new Date(),
      sentBy:   req.user._id,
    };
    investment.status = 'awaiting_payment';   // new intermediate status
    await investment.save();

    // --- Socket.io push (real-time) ------------------------------------------
    const userId = investment.user._id.toString();
    const socketPayload = {
      investmentId: investmentId,
      paymentMethod: investment.paymentMethod,
      usdAmount:    investment.amount,
      ...details,
    };

    const socketSent = emitPaymentDetails(userId, socketPayload);

    // --- backup email (in case socket connection was dropped) ---------------
    await emailService.sendPaymentDetailsEmail(investment.user, socketPayload);

    res.status(200).json({
      success:    true,
      message:    'Payment details sent to user',
      socketSent, // boolean – tells admin if socket delivery happened
      data:       investment,
    });
  } catch (error) {
    console.error('Send payment details error:', error);
    res.status(500).json({ success: false, message: 'Failed to send payment details' });
  }
};

// ===========================================================================
// Get all pending investments
// @route   GET /api/admin/investments/pending
// @access  Private/Admin
// ===========================================================================
exports.getPendingInvestments = async (req, res) => {
  try {
    const pendingInvestments = await Investment.find({
      paymentStatus: 'pending',
    })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count:   pendingInvestments.length,
      data:    pendingInvestments,
    });
  } catch (error) {
    console.error('Get pending investments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending investments' });
  }
};

// ===========================================================================
// Approve crypto payment
// @route   PUT /api/admin/payments/crypto/approve/:investmentId
// @access  Private/Admin
// ===========================================================================
exports.approveCryptoPayment = async (req, res) => {
  try {
    const { investmentId } = req.params;
    const investment = await Investment.findById(investmentId).populate('user');

    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment not found' });
    }

    if (investment.paymentStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Investment is not pending' });
    }

    // --- fix: compute dates from the investment's own fields -----------------
    const startDate = new Date();
    const endDate   = new Date(startDate.getTime() + (investment.timeframeWeeks * 7 * 24 * 60 * 60 * 1000));

    // Update investment
    investment.paymentStatus = 'completed';
    investment.status        = 'active';
    investment.startDate     = startDate;
    investment.endDate       = endDate;
    await investment.save();

    // Update transaction
    await Transaction.updateOne({ investment: investmentId }, { status: 'completed' });

    // Update user totals
    const user = investment.user;
    user.totalInvested  += investment.amount;
    user.currentBalance += investment.amount;
    await user.save();

    // Confirmation email + socket push
    await emailService.sendInvestmentConfirmationEmail(user, investment);
    emitInvestmentUpdate(user._id.toString(), {
      investmentId,
      status:  'approved',
      message: 'Your crypto payment has been verified and your investment is now active!',
    });

    res.status(200).json({ success: true, message: 'Payment approved and investment activated', data: investment });
  } catch (error) {
    console.error('Approve crypto payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve payment' });
  }
};

// ===========================================================================
// Reject crypto payment
// @route   PUT /api/admin/payments/crypto/reject/:investmentId
// @access  Private/Admin
// ===========================================================================
exports.rejectCryptoPayment = async (req, res) => {
  try {
    const { investmentId } = req.params;
    const { reason }       = req.body;

    const investment = await Investment.findById(investmentId).populate('user');
    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment not found' });
    }

    investment.paymentStatus = 'failed';
    investment.status        = 'rejected';
    await investment.save();

    await Transaction.updateOne({ investment: investmentId }, { status: 'failed' });

    const user = investment.user;

    // Use the dedicated rejection email helper
    await emailService.sendPaymentRejectedEmail(user, {
      investmentId,
      reason,
      paymentMethod: 'crypto',
    });

    // Socket notification
    emitInvestmentUpdate(user._id.toString(), {
      investmentId,
      status:  'rejected',
      message: reason || 'Your crypto payment could not be verified.',
    });

    res.status(200).json({ success: true, message: 'Payment rejected' });
  } catch (error) {
    console.error('Reject crypto payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject payment' });
  }
};

// ===========================================================================
// Approve wire transfer
// @route   PUT /api/admin/payments/wire/approve/:investmentId
// @access  Private/Admin
// ===========================================================================
exports.approveWireTransfer = async (req, res) => {
  try {
    const { investmentId } = req.params;
    const investment = await Investment.findById(investmentId).populate('user');

    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment not found' });
    }

    if (investment.paymentStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Investment is not pending' });
    }

    // --- fix: compute dates from the investment's own fields -----------------
    const startDate = new Date();
    const endDate   = new Date(startDate.getTime() + (investment.timeframeWeeks * 7 * 24 * 60 * 60 * 1000));

    investment.paymentStatus = 'completed';
    investment.status        = 'active';
    investment.startDate     = startDate;
    investment.endDate       = endDate;
    await investment.save();

    await Transaction.updateOne({ investment: investmentId }, { status: 'completed' });

    const user = investment.user;
    user.totalInvested  += investment.amount;
    user.currentBalance += investment.amount;
    await user.save();

    await emailService.sendInvestmentConfirmationEmail(user, investment);
    emitInvestmentUpdate(user._id.toString(), {
      investmentId,
      status:  'approved',
      message: 'Your wire transfer has been verified and your investment is now active!',
    });

    res.status(200).json({ success: true, message: 'Wire transfer approved and investment activated', data: investment });
  } catch (error) {
    console.error('Approve wire transfer error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve wire transfer' });
  }
};

// ===========================================================================
// Reject wire transfer
// @route   PUT /api/admin/payments/wire/reject/:investmentId
// @access  Private/Admin
// ===========================================================================
exports.rejectWireTransfer = async (req, res) => {
  try {
    const { investmentId } = req.params;
    const { reason }       = req.body;

    const investment = await Investment.findById(investmentId).populate('user');
    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment not found' });
    }

    investment.paymentStatus = 'failed';
    investment.status        = 'rejected';
    await investment.save();

    await Transaction.updateOne({ investment: investmentId }, { status: 'failed' });

    const user = investment.user;

    await emailService.sendPaymentRejectedEmail(user, {
      investmentId,
      reason,
      paymentMethod: 'wire',
    });

    emitInvestmentUpdate(user._id.toString(), {
      investmentId,
      status:  'rejected',
      message: reason || 'Your wire transfer could not be verified.',
    });

    res.status(200).json({ success: true, message: 'Wire transfer rejected' });
  } catch (error) {
    console.error('Reject wire transfer error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject wire transfer' });
  }
};

// ===========================================================================
// Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
// ===========================================================================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// ===========================================================================
// Platform statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
// ===========================================================================
exports.getPlatformStats = async (req, res) => {
  try {
    const totalUsers          = await User.countDocuments();
    const verifiedUsers       = await User.countDocuments({ isVerified: true });
    const totalInvestments    = await Investment.countDocuments();
    const activeInvestments   = await Investment.countDocuments({ status: 'active' });
    const pendingInvestments  = await Investment.countDocuments({ paymentStatus: 'pending' });

    const investments = await Investment.find({ status: { $in: ['active', 'completed'] } });
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);

    res.status(200).json({
      success: true,
      data: { totalUsers, verifiedUsers, totalInvestments, activeInvestments, pendingInvestments, totalInvested },
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
};