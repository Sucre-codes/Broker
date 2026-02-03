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
    enum: ['Tesla', 'SpaceX', 'Deepmind Technology', 'The boring company', 'Neuralink']
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
    min: [100, 'Minimum investment is $100']
  },

  // Timeframe in weeks
  timeframeWeeks: {
    type: Number,
    required: [true, 'Please provide investment timeframe'],
    min: [1, 'Minimum investment period is 1 week']
  },

  // ROI Calculation
  annualReturnRate: { type: Number, required: true },
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
// Static: return rate for a plan
// ---------------------------------------------------------------------------
investmentSchema.statics.getReturnRate = function(plan) {
  const rates = {
    starter:  { min: 0.08, max: 0.12 },   // 8-12 %
    silver:   { min: 0.15, max: 0.20 },   // 15-20 %
    gold:     { min: 0.25, max: 0.35 },   // 25-35 %
    platinum: { min: 0.40, max: 0.50 },   // 40-50 %
  };
  const rate = rates[plan];
  if (!rate) throw new Error(`Unknown plan: ${plan}`);
  return (rate.min + rate.max) / 2;
};

// ---------------------------------------------------------------------------
// Pre-save hook — auto-fill ROI fields for new documents
// ---------------------------------------------------------------------------
investmentSchema.pre('save', function(next) {
  if (this.isNew) {
    this.annualReturnRate = this.constructor.getReturnRate(this.plan);
    this.expectedROI      = (this.amount * this.annualReturnRate * this.timeframeWeeks) / 52;
    const totalDays       = this.timeframeWeeks * 7;
    this.dailyGrowth      = this.expectedROI / totalDays;
    this.currentValue     = this.amount;
    this.endDate          = new Date(this.startDate.getTime() + totalDays * 24 * 60 * 60 * 1000);
  }
  next();
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
    case 'The boring company':  variance = 1 + (Math.random() - 0.5) * 0.04; break; // ±2 %
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