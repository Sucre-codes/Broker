const Withdrawal = require('../models/Withdrawal');
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { sendWithdrawalRequestEmail } = require('../utils/emails');

/**
 * @desc    Request withdrawal
 * @route   POST /api/withdrawals
 * @access  Private
 */
exports.requestWithdrawal = async (req, res) => {
  try {
    const { investmentId, withdrawalMethod, withdrawalDetails } = req.body;
    
    // Find investment
    const investment = await Investment.findById(investmentId);
    
    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }
    
    // Verify investment belongs to user
    if (investment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw from this investment'
      });
    }
    
    // Check if investment is active
    if (investment.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Investment is not active'
      });
    }
    
    // Check if minimum 2 weeks have passed
    if (!investment.canWithdraw()) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal period is 2 weeks from start date'
      });
    }
    
    // Update investment current value
    investment.updateCurrentValue();
    await investment.save();
    
    // Calculate profit
    const profit = investment.currentValue - investment.amount;
    
    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      user: req.user.id,
      investment: investmentId,
      amount: investment.amount,
      profit,
      withdrawalMethod,
      withdrawalDetails,
      status: 'pending'
    });
    
    // Update investment status
    investment.status = 'withdrawn';
    await investment.save();
    
    // Create transaction record
    await Transaction.create({
      user: req.user.id,
      investment: investmentId,
      type: 'withdrawal',
      amount: investment.currentValue,
      status: 'pending',
      paymentMethod: withdrawalMethod,
      description: `Withdrawal request for ${investment.assetType} investment`
    });
    
    // Get user details for email
    const user = await User.findById(req.user.id);
    
    // Send withdrawal request email
    try {
      await sendWithdrawalRequestEmail(
        user.email,
        user.firstName,
        investment.amount,
        profit,
        withdrawalDetails
      );
    } catch (error) {
      console.error('Error sending withdrawal email:', error);
    }
    
    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully. You will receive an email confirmation.',
      data: withdrawal
    });
  } catch (error) {
    console.error('Request withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing withdrawal request',
      error: error.message
    });
  }
};

/**
 * @desc    Get all user withdrawals
 * @route   GET /api/withdrawals
 * @access  Private
 */
exports.getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user.id })
      .populate('investment', 'assetType plan amount')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: withdrawals.length,
      data: withdrawals
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching withdrawals',
      error: error.message
    });
  }
};

/**
 * @desc    Get single withdrawal
 * @route   GET /api/withdrawals/:id
 * @access  Private
 */
exports.getWithdrawal = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id)
      .populate('investment', 'assetType plan amount timeframeWeeks');
    
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found'
      });
    }
    
    // Verify withdrawal belongs to user
    if (withdrawal.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this withdrawal'
      });
    }
    
    res.status(200).json({
      success: true,
      data: withdrawal
    });
  } catch (error) {
    console.error('Get withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching withdrawal',
      error: error.message
    });
  }
};
  