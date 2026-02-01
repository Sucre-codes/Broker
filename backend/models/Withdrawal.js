const mongoose = require('mongoose');

/**
 * Withdrawal Schema
 * Handles withdrawal requests and processing
 */
const withdrawalSchema = new mongoose.Schema({
  // User Reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Investment Reference
  investment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment',
    required: true
  },
  
  // Withdrawal Amount
  amount: {
    type: Number,
    required: true
  },
  
  // Profit earned
  profit: {
    type: Number,
    required: true
  },
  
  // Withdrawal Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending'
  },
  
  // Withdrawal Method (bank transfer, crypto wallet, etc.)
  withdrawalMethod: {
    type: String,
    required: true
  },
  
  // Withdrawal Details (account number, wallet address, etc.)
  withdrawalDetails: {
    type: String,
    required: true
  },
  
  // Admin notes
  adminNotes: String,
  
  // Processing dates
  requestedAt: {
    type: Date,
    default: Date.now
  },
  
  processedAt: Date,
  
  completedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
