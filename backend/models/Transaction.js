const mongoose = require('mongoose');

/**
 * Transaction Schema
 * Tracks all financial transactions (deposits, withdrawals, returns)
 */
const transactionSchema = new mongoose.Schema({
  // User Reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Investment Reference (if applicable)
  investment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment'
  },
  
  // Transaction Type
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'return', 'fee'],
    required: true
  },
  
  // Amount
  amount: {
    type: Number,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // Payment Method
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'crypto', 'wire', 'balance'],
    required: true
  },
  
  // External Transaction ID (from payment gateway)
  externalTransactionId: String,
  
  // Description
  description: String,
  
  // Metadata (flexible field for additional info)
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

/**
 * Index for faster queries
 */
transactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
