const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
//const { sendInvestmentConfirmationEmail } = require('../utils/email');

/**
 * @desc    Create new investment
 * @route   POST /api/investments
 * @access  Private
 */ 
exports.createInvestment = async (req, res) => {
  try {
    const { assetType, plan, amount, timeframeWeeks, paymentMethod, transactionId } = req.body;
    
    // Validate minimum amount
    if (amount < 500) {
      return res.status(400).json({
        success: false,
        message: 'Minimum investment amount is $500'
      });
    }
    
    // Validate minimum timeframe
    if (timeframeWeeks < 1) {
      return res.status(400).json({
        success: false,
        message: 'Minimum investment period is 1 week'
      });
    }
    
    // Get user's auto-compound preference
    const user = await User.findById(req.user.id);
    
    // Create investment
    const investment = await Investment.create({
      user: req.user.id,
      assetType,
      plan,
      amount,
      timeframeWeeks,
      paymentMethod,
      transactionId,
      paymentStatus: 'completed',
      autoCompound: user.autoCompound || false
    });
    
    // Update user's total invested
    user.totalInvested = (user.totalInvested || 0) + amount;
    user.currentBalance = (user.currentBalance || 0) + amount;
    await user.save();
    
    // Create transaction record
    await Transaction.create({
      user: req.user.id,
      investment: investment._id,
      type: 'deposit',
      amount,
      status: 'completed',
      paymentMethod,
      externalTransactionId: transactionId,
      description: `Investment in ${assetType} - ${plan} plan`
    });
    
    // // Send confirmation email
    // try {
    //   await sendInvestmentConfirmationEmail(user.email, user.firstName, investment);
    // } catch (error) {
    //   console.error('Error sending investment confirmation email:', error);
    // }
    
    res.status(201).json({
      success: true,
      message: 'Investment created successfully',
      data: investment
    });
  } catch (error) {
    console.error('Create investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating investment',
      error: error.message
    });
  }
};

/**
 * @desc    Get all user investments
 * @route   GET /api/investments
 * @access  Private
 */
exports.getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    // Update current values for all active investments
    for (let investment of investments) {
      if (investment.status === 'active') {
        investment.updateCurrentValue();
        await investment.save();
      }
    }
    
    res.status(200).json({
      success: true,
      count: investments.length,
      data: investments
    });
  } catch (error) {
    console.error('Get investments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching investments',
      error: error.message
    });
  }
};

/**
 * @desc    Get single investment
 * @route   GET /api/investments/:id
 * @access  Private
 */
exports.getInvestment = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    
    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }
    
    // Make sure investment belongs to user
    if (investment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this investment'
      });
    }
    
    // Update current value if active
    if (investment.status === 'active') {
      investment.updateCurrentValue();
      await investment.save();
    }
    
    res.status(200).json({
      success: true,
      data: investment
    });
  } catch (error) {
    console.error('Get investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching investment',
      error: error.message
    });
  }
};

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/investments/dashboard/stats
 * @access  Private
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get all user investments
    const investments = await Investment.find({ user: req.user.id });
    
    // Calculate statistics
    let totalInvested = 0;
    let currentBalance = 0;
    let totalReturns = 0;
    let activeInvestments = 0;
    
    for (let investment of investments) {
      if (investment.status === 'active') {
        activeInvestments++;
        
        // Update current value
        investment.updateCurrentValue();
        
        // Add to totals
        totalInvested += investment.amount;
        currentBalance += investment.currentValue;
        totalReturns += (investment.currentValue - investment.amount);
        
        // Save updated investment
        await investment.save();
      } else if (investment.status === 'completed') {
        totalInvested += investment.amount;
        const finalValue = investment.amount + investment.expectedROI;
        currentBalance += finalValue;
        totalReturns += investment.expectedROI;
      }
    }
    
    // Update user's totals
    const user = await User.findById(req.user.id);
    if (user) {
      user.totalInvested = totalInvested;
      user.currentBalance = currentBalance;
      user.totalReturns = totalReturns;
      await user.save();
    }
    
    // Get recent investments (last 5)
    const recentInvestments = investments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    res.status(200).json({
      success: true,
      data: {
        totalInvested: totalInvested.toFixed(2),
        currentBalance: currentBalance.toFixed(2),
        totalReturns: totalReturns.toFixed(2),
        activeInvestments,
        totalInvestments: investments.length,
        recentInvestments
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Calculate investment preview (before creating)
 * @route   POST /api/investments/calculate
 * @access  Private
 */
exports.calculateInvestment = async (req, res) => {
  try {
    const { plan, amount, timeframeWeeks } = req.body;
    
    // Validate inputs
    if (!plan || !amount || !timeframeWeeks) {
      return res.status(400).json({
        success: false,
        message: 'Please provide plan, amount, and timeframeWeeks'
      });
    }

    if (amount < 500) {
      return res.status(400).json({
        success: false,
        message: 'Minimum investment amount is $500'
      });
    }

    if (timeframeWeeks < 1) {
      return res.status(400).json({
        success: false,
        message: 'Minimum investment period is 1 week'
      });
    }
    
    // Get weekly return rate
    const weeklyReturnRate = Investment.getWeeklyReturnRate(plan);
    
    // Calculate using weekly rate formula
    // Formula: amount × weeklyReturnRate × timeframeWeeks
    const expectedROI = amount * weeklyReturnRate * timeframeWeeks;
    
    // Calculate daily growth
    const totalDays = timeframeWeeks * 7;
    const dailyGrowth = expectedROI / totalDays;
    
    // Calculate end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + totalDays);
    
    res.status(200).json({
      success: true,
      data: {
        amount: parseFloat(amount).toFixed(2),
        plan,
        timeframeWeeks,
        weeklyReturnRate: (weeklyReturnRate * 100).toFixed(0) + '%',
        expectedROI: expectedROI.toFixed(2),
        totalReturn: (parseFloat(amount) + expectedROI).toFixed(2),
        dailyGrowth: dailyGrowth.toFixed(2),
        endDate
      }
    });
  } catch (error) {
    console.error('Calculate investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating investment',
      error: error.message
    });
  }
};