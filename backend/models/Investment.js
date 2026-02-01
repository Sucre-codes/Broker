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
    enum: ['Tesla', 'SpaceX', 'Deepmind Technology', 'The boring company','Neuralink']
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
    min: [10, 'Minimum investment is $10']
  },
  
  // Timeframe in weeks
  timeframeWeeks: {
    type: Number,
    required: [true, 'Please provide investment timeframe'],
    min: [2, 'Minimum investment period is 2 weeks']
  },
  
  // ROI Calculation
  annualReturnRate: {
    type: Number,
    required: true
  },
  
  expectedROI: {
    type: Number,
    required: true
  },
  
  currentValue: {
    type: Number,
    required: true
  },
  
  dailyGrowth: {
    type: Number,
    required: true
  },
  
  // Investment Status
  status: {
    type: String,
    enum: ['active', 'completed', 'withdrawn'],
    default: 'active'
  },
  
  // Important Dates
  startDate: {
    type: Date,
    default: Date.now
  },
  
  endDate: {
    type: Date,
    required: true
  },
  
  lastUpdateDate: {
    type: Date,
    default: Date.now
  },
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'crypto', 'wire'],
    required: true
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  
  transactionId: String,
  
  // Auto-compound for this specific investment
  autoCompound: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

/**
 * Calculate annual return rate based on plan
 */
investmentSchema.statics.getReturnRate = function(plan) {
  const rates = {
    'starter': { min: 0.08, max: 0.12 },   // 8-12%
    'silver': { min: 0.15, max: 0.20 },    // 15-20%
    'gold': { min: 0.25, max: 0.35 },      // 25-35%
    'platinum': { min: 0.40, max: 0.50 }   // 40-50%
  };
  
  const rate = rates[plan];
  // Return average of min and max
  return (rate.min + rate.max) / 2;
};

/**
 * Calculate expected ROI and daily growth before saving
 */
investmentSchema.pre('save', function(next) {
  if (this.isNew) {
    // Get annual return rate for the plan
    this.annualReturnRate = this.constructor.getReturnRate(this.plan);
    
    // Calculate expected ROI: (amount × annual rate × weeks) / 52
    this.expectedROI = (this.amount * this.annualReturnRate * this.timeframeWeeks) / 52;
    
    // Calculate daily growth: expectedROI / total days
    const totalDays = this.timeframeWeeks * 7;
    this.dailyGrowth = this.expectedROI / totalDays;
    
    // Set current value to initial amount
    this.currentValue = this.amount;
    
    // Calculate end date
    this.endDate = new Date(this.startDate.getTime() + (this.timeframeWeeks * 7 * 24 * 60 * 60 * 1000));
  }
  
  next();
});

/**
 * Calculate current value based on days elapsed
 */
investmentSchema.methods.updateCurrentValue = function() {
  const now = new Date();
  const startTime = this.startDate.getTime();
  const currentTime = now.getTime();
  const daysElapsed = Math.floor((currentTime - startTime) / (24 * 60 * 60 * 1000));
  
  // Add slight variance based on asset type for realism
  let variance = 1;
  switch(this.assetType) {
    case 'crypto':
      // Crypto has highest volatility: ±5%
      variance = 1 + ((Math.random() - 0.5) * 0.1);
      break;
    case 'stocks':
      // Stocks have medium-high volatility: ±3%
      variance = 1 + ((Math.random() - 0.5) * 0.06);
      break;
    case 'business':
      // Business has medium volatility: ±2%
      variance = 1 + ((Math.random() - 0.5) * 0.04);
      break;
    case 'real-estate':
      // Real estate has low volatility: ±1%
      variance = 1 + ((Math.random() - 0.5) * 0.02);
      break;
  }
  
  // Calculate current value with variance
  this.currentValue = this.amount + (this.dailyGrowth * daysElapsed * variance);
  
  // Don't exceed expected final value
  const finalValue = this.amount + this.expectedROI;
  if (this.currentValue > finalValue) {
    this.currentValue = finalValue;
  }
  
  this.lastUpdateDate = now;
  return this.currentValue;
};

/**
 * Check if investment period has ended
 */
investmentSchema.methods.hasEnded = function() {
  return new Date() >= this.endDate;
};

/**
 * Check if minimum 2 weeks have passed for withdrawal
 */
investmentSchema.methods.canWithdraw = function() {
  const now = new Date();
  const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;
  const timeSinceStart = now.getTime() - this.startDate.getTime();
  return timeSinceStart >= twoWeeksInMs;
};

module.exports = mongoose.model('Investment', investmentSchema);
