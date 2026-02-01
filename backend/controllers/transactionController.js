const Transaction = require('../models/Transaction');

/**
 * @desc    Get all user transactions
 * @route   GET /api/transactions
 * @access  Private
 */
exports.getTransactions = async (req, res) => {
  try {
    const { type, status, limit = 50, page = 1 } = req.query;
    
    // Build query
    let query = { user: req.user.id };
    
    if (type) query.type = type;
    if (status) query.status = status;
    
    // Execute query with pagination
    const transactions = await Transaction.find(query)
      .populate('investment', 'assetType plan')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    // Get total count
    const total = await Transaction.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

/**
 * @desc    Get single transaction
 * @route   GET /api/transactions/:id
 * @access  Private
 */
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('investment', 'assetType plan amount');
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Verify transaction belongs to user
    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this transaction'
      });
    }
    
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message
    });
  }
};
