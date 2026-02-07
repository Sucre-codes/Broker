const mongoose = require('mongoose');

/**
 * Investment Schema
 * Handles all investment data and ROI calculations
 */
const investmentSchema = new mongoose.Schema({
  // User Reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Investment Details
  assetType: {
    type: String,
    required: true,
    enum: ['Tesla', 'SpaceX', 'Deepmind Technology', 'The Boring Company', 'Neuralink']
  },

  // VIP Plan Tiers
  plan: {
    type: String,
    required: true,
    enum: ['starter', 'silver', 'gold', 'platinum']
  },

  // Investment Amount
  amount: {
    type: Number,
    required: [true, 'Please provide investment amount'],
    min: [500, 'Minimum investment is $500']
  },

  // Timeframe in weeks
  timeframeWeeks: {
    type: Number,
    required: [true, 'Please provide investment timeframe'],
    min: [1, 'Minimum investment period is 1 week']
  },

  // ROI Calculation
  weeklyReturnRate: { type: Number, required: true },
  expectedROI:      { type: Number, required: true },
  currentValue:     { type: Number, required: true },
  dailyGrowth:      { type: Number, required: true },

  // ---------------------------------------------------------------------------
  // Investment Status
  //   pending            – just initiated, waiting for admin to send details
  //   awaiting_payment   – admin has sent details, user hasn't paid yet
  //   active             – payment confirmed, investment is running
  //   completed          – investment period ended
  //   withdrawn          – user withdrew funds
  //   rejected           – payment was rejected by admin
  // ---------------------------------------------------------------------------
  status: {
    type: String,
    enum: ['pending', 'awaiting_payment', 'active', 'completed', 'withdrawn', 'rejected'],
    default: 'active'
  },

  // Important Dates
  startDate:      { type: Date, default: Date.now },
  endDate:        { type: Date, required: true },
  lastUpdateDate: { type: Date, default: Date.now },

  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['crypto', 'wire'],
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },

  transactionId: String,

  // Auto-compound for this specific investment
  autoCompound: { type: Boolean, default: false },

  // ---------------------------------------------------------------------------
  // NEW — user-submitted proof (tx hash / wire reference)
  //   Set by submitCryptoProof / submitWireProof in paymentService
  // ---------------------------------------------------------------------------
  pendingDetails: {
    currency:        String,   // crypto currency code
    transactionHash: String,   // crypto tx hash
    referenceNumber: String,   // wire ref
    senderBank:      String,
    senderName:      String,
    submittedAt:     Date,
  },

  // ---------------------------------------------------------------------------
  // NEW — details the admin pushed to the user
  //   Set by sendPaymentDetails in adminController
  // ---------------------------------------------------------------------------
  adminDetails: {
    type: mongoose.Schema.Types.Mixed,   // flexible — crypto and wire have different shapes
    default: null,
  },

}, { timestamps: true });

// ---------------------------------------------------------------------------
// Static method — Get WEEKLY return rate based on plan
// ---------------------------------------------------------------------------
investmentSchema.statics.getWeeklyReturnRate = function(plan) {
  const weeklyRates = {
    starter:  1.20,   // 120% return per week
    silver:   1.50,   // 150% return per week
    gold:     3.00,   // 300% return per week
    platinum: 4.00,   // 400% return per week
  };
  
  const rate = weeklyRates[plan];
  if (rate === undefined) throw new Error(`Unknown plan: ${plan}`);
  
  return rate;
};

// ---------------------------------------------------------------------------
// BACKWARD COMPATIBILITY: Keep old method name as alias
// ---------------------------------------------------------------------------
investmentSchema.statics.getReturnRate = function(plan) {
  return this.getWeeklyReturnRate(plan);
};

// ---------------------------------------------------------------------------
// Pre-save hook — auto-fill ROI fields for new documents
// ---------------------------------------------------------------------------
investmentSchema.pre('save', function () {
  if (!this.isNew) return;

  try {
    // Get weekly return rate (as decimal multiplier)
    this.weeklyReturnRate = this.constructor.getWeeklyReturnRate(this.plan);
    
    // Calculate expected ROI based on investment amount, weekly rate, and timeframe
    // Formula: amount × weeklyReturnRate × timeframeWeeks
    this.expectedROI = this.amount * this.weeklyReturnRate * this.timeframeWeeks;

    const totalDays = this.timeframeWeeks * 7;

    // Daily growth = total ROI spread across all days
    this.dailyGrowth = this.expectedROI / totalDays;
    
    // Starting value = initial investment
    this.currentValue = this.amount;

    // Calculate end date based on total days
    this.endDate = new Date(
      this.startDate.getTime() + totalDays * 24 * 60 * 60 * 1000
    );
  } catch (error) {
    next(error);
  }
});

// ---------------------------------------------------------------------------
// Instance method — recalculate currentValue based on days elapsed
// ---------------------------------------------------------------------------
investmentSchema.methods.updateCurrentValue = function() {
  const now          = new Date();
  const daysElapsed  = Math.floor((now - this.startDate) / (24 * 60 * 60 * 1000));

  // Slight per-asset variance for realism
  let variance = 1;
  switch (this.assetType) {
    case 'Tesla':               variance = 1 + (Math.random() - 0.5) * 0.10; break; // ±5 %
    case 'SpaceX':              variance = 1 + (Math.random() - 0.5) * 0.06; break; // ±3 %
    case 'The Boring Company':  variance = 1 + (Math.random() - 0.5) * 0.04; break; // ±2 %
    case 'Deepmind Technology': variance = 1 + (Math.random() - 0.5) * 0.02; break; // ±1 %
    case 'Neuralink':           variance = 1 + (Math.random() - 0.5) * 0.01; break; // ±0.5 %
    default:                    variance = 1;
  }

  this.currentValue = this.amount + (this.dailyGrowth * daysElapsed * variance);

  // Cap at final expected value
  const finalValue = this.amount + this.expectedROI;
  if (this.currentValue > finalValue) this.currentValue = finalValue;
                     
  this.lastUpdateDate = now;
  return this.currentValue;
};

// ---------------------------------------------------------------------------
// Instance method — has the investment period ended?
// ---------------------------------------------------------------------------
investmentSchema.methods.hasEnded = function() {
  return new Date() >= this.endDate;
};

// ---------------------------------------------------------------------------
// Instance method — can the user withdraw? (min 1 week elapsed)
// ---------------------------------------------------------------------------
investmentSchema.methods.canWithdraw = function() {
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  return (new Date() - this.startDate) >= oneWeekMs;
};

module.exports = mongoose.model('Investment', investmentSchema);