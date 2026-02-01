/**
 * Admin Controller
 * Handles admin operations for payment verification and management
 */

const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const emailService = require('../services/emailService');

/**
 * @desc    Get all pending investments
 * @route   GET /api/admin/investments/pending
 * @access  Private/Admin
 */
exports.getPendingInvestments = async (req, res) => {
  try {
    const pendingInvestments = await Investment.find({
      paymentStatus: 'pending',
    })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingInvestments.length,
      data: pendingInvestments,
    });
  } catch (error) {
    console.error('Get pending investments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending investments',
    });
  }
};

/**
 * @desc    Approve crypto payment
 * @route   PUT /api/admin/payments/crypto/approve/:investmentId
 * @access  Private/Admin
 */
exports.approveCryptoPayment = async (req, res) => {
  try {
    const { investmentId } = req.params;

    const investment = await Investment.findById(investmentId).populate('user');

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found',
      });
    }

    if (investment.paymentStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Investment is not pending',
      });
    }

      const starting = new Date();
    const ending = new Date(startDate.getTime() + (timeframeWeeks * 7 * 24 * 60 * 60 * 1000));

    // Update investment status
    investment.paymentStatus = 'completed';
    investment.status = 'active';
    investment.startDate = starting;
    investment.endDate = ending;
    await investment.save();

    // Update transaction
    await Transaction.updateOne(
      { investment: investmentId },
      { status: 'completed' }
    );

      
    // Update user totals
    const user = investment.user;
    user.totalInvested += investment.amount;
    user.currentBalance += investment.amount;
    await user.save();

    // Send confirmation email
    await emailService.sendInvestmentConfirmationEmail(user, investment);

    res.status(200).json({
      success: true,
      message: 'Payment approved and investment activated',
      data: investment,
    });
  } catch (error) {
    console.error('Approve crypto payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve payment',
    });
  }
};

/**
 * @desc    Reject crypto payment
 * @route   PUT /api/admin/payments/crypto/reject/:investmentId
 * @access  Private/Admin
 */
exports.rejectCryptoPayment = async (req, res) => {
  try {
    const { investmentId } = req.params;
    const { reason } = req.body;

    const investment = await Investment.findById(investmentId).populate('user');

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found',
      });
    }

    // Update investment status
    investment.paymentStatus = 'failed';
    investment.status = 'rejected';
    await investment.save();

    // Update transaction
    await Transaction.updateOne(
      { investment: investmentId },
      { status: 'failed' }
    );

    // Send rejection email
    const user = investment.user;
    await emailService.sendEmail({
      email: user.email,
      subject: 'Payment Verification Failed - InvestHub',
      html: `
        <h2>Hello ${user.firstName},</h2>
        <p>Unfortunately, we could not verify your cryptocurrency payment for the following reason:</p>
        <p><strong>${reason || 'Payment verification failed'}</strong></p>
        <p>Please contact support for assistance or submit a new payment.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: 'Payment rejected',
    });
  } catch (error) {
    console.error('Reject crypto payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject payment',
    });
  }
};

/**
 * @desc    Approve wire transfer
 * @route   PUT /api/admin/payments/wire/approve/:investmentId
 * @access  Private/Admin
 */
exports.approveWireTransfer = async (req, res) => {
  try {
    const { investmentId } = req.params;

    const investment = await Investment.findById(investmentId).populate('user');

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found',
      });
    }

    if (investment.paymentStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Investment is not pending',
      });
    }
    const starting = new Date();
    const ending = new Date(startDate.getTime() + (timeframeWeeks * 7 * 24 * 60 * 60 * 1000));

    // Update investment status
    investment.paymentStatus = 'completed';
    investment.status = 'active';
    investment.startDate= starting;
    investment.endDate=ending
    await investment.save();

    // Update transaction
    await Transaction.updateOne(
      { investment: investmentId },
      { status: 'completed' }
    );

    // Update user totals
    const user = investment.user;
    user.totalInvested += investment.amount;
    user.currentBalance += investment.amount;
    await user.save();

    // Send confirmation email
    await emailService.sendInvestmentConfirmationEmail(user, investment);

    res.status(200).json({
      success: true,
      message: 'Wire transfer approved and investment activated',
      data: investment,
    });
  } catch (error) {
    console.error('Approve wire transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve wire transfer',
    });
  }
};

/**
 * @desc    Reject wire transfer
 * @route   PUT /api/admin/payments/wire/reject/:investmentId
 * @access  Private/Admin
 */
exports.rejectWireTransfer = async (req, res) => {
  try {
    const { investmentId } = req.params;
    const { reason } = req.body;

    const investment = await Investment.findById(investmentId).populate('user');

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found',
      });
    }

    // Update investment status
    investment.paymentStatus = 'failed';
    investment.status = 'rejected';
    await investment.save();

    // Update transaction
    await Transaction.updateOne(
      { investment: investmentId },
      { status: 'failed' }
    );

    // Send rejection email
    const user = investment.user;
    await emailService.sendEmail({
      email: user.email,
      subject: 'Wire Transfer Verification Failed - InvestHub',
      html: `
        <h2>Hello ${user.firstName},</h2>
        <p>Unfortunately, we could not verify your wire transfer for the following reason:</p>
        <p><strong>${reason || 'Transfer verification failed'}</strong></p>
        <p>Please contact support for assistance or submit a new transfer.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: 'Wire transfer rejected',
    });
  } catch (error) {
    console.error('Reject wire transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject wire transfer',
    });
  }
};

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

/**
 * @desc    Get platform statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const totalInvestments = await Investment.countDocuments();
    const activeInvestments = await Investment.countDocuments({ status: 'active' });
    const pendingInvestments = await Investment.countDocuments({ paymentStatus: 'pending' });

    // Calculate total invested
    const investments = await Investment.find({ status: { $in: ['active', 'completed'] } });
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        totalInvestments,
        activeInvestments,
        pendingInvestments,
        totalInvested,
      },
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
};
