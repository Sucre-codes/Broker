const Withdrawal = require('../models/Withdrawal');
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { sendWithdrawalInitiatedEmail } = require('../services/emailService');

/**
 * @desc    Request withdrawal
 * @route   POST /api/withdrawals
 * @access  Private
 */
exports.requestWithdrawal = async (req, res) => {
  try {
    const { investmentId, withdrawalMethod, withdrawalDetails } = req.body;

    // ---------------------------------------------------------------------
    // 1. Find investment
    // ---------------------------------------------------------------------
    const investment = await Investment.findById(investmentId);

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found',
      });
    }

    // ---------------------------------------------------------------------
    // 2. Ownership check
    // ---------------------------------------------------------------------
    if (investment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw from this investment',
      });
    }

    // ---------------------------------------------------------------------
    // 3. Status checks
    // ---------------------------------------------------------------------
    if (investment.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Investment is not active',
      });
    }

    if (!investment.canWithdraw()) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal period is 2 weeks from start date',
      });
    }

    // ---------------------------------------------------------------------
    // 4. Update investment value
    // ---------------------------------------------------------------------
    investment.currentValue();
    await investment.save();

    const profit = investment.currentValue - investment.amount;

    // ---------------------------------------------------------------------
    // 5. Create withdrawal record
    // ---------------------------------------------------------------------
    const withdrawal = await Withdrawal.create({
      user: req.user.id,
      investment: investmentId,
      amount: investment.amount,
      profit,
      method: withdrawalMethod,                // <-- aligns with email
      destination: withdrawalDetails || null,  // <-- aligns with email
      status: 'pending',
    });

    // ---------------------------------------------------------------------
    // 6. Update investment status
    // ---------------------------------------------------------------------
    investment.status = 'withdrawn';
    await investment.save();

    // ---------------------------------------------------------------------
    // 7. Create transaction record
    // ---------------------------------------------------------------------
    await Transaction.create({
      user: req.user.id,
      investment: investmentId,
      type: 'withdrawal',
      amount: investment.currentValue,
      status: 'pending',
      paymentMethod: withdrawalMethod,
      description: `Withdrawal request for ${investment.assetType} investment`,
    });

    // ---------------------------------------------------------------------
    // 8. Send withdrawal initiation email (non-blocking)
    // ---------------------------------------------------------------------
    const user = await User.findById(req.user.id);

    sendWithdrawalInitiatedEmail(user, withdrawal)
      .catch(err => console.error('Withdrawal email failed:', err));

    // ---------------------------------------------------------------------
    // 9. Response
    // ---------------------------------------------------------------------
    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully. Email confirmation sent.',
      data: withdrawal,
    });

  } catch (error) {
    console.error('Request withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing withdrawal request',
      error: error.message,
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
  