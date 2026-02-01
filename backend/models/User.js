/**
 * User Model
 * Handles user data structure, password hashing, and JWT generation
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password by default
    },
    profilePicture: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    totalInvested: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalReturns: {
      type: Number,
      default: 0,
    },
    currentBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    autoCompound: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return;
  }

  try {
    // Generate salt with 12 rounds
    const salt = await bcrypt.genSalt(12);
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    
  } catch (error) {
    next(error);
  }
});

/**
 * Compare entered password with hashed password in database
 * @param {String} enteredPassword - Password to check
 * @returns {Boolean} - True if password matches
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate JWT token for authentication
 * @returns {String} - JWT token
 */
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      isAdmin: this.isAdmin 
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

/**
 * Generate email verification token
 * @returns {String} - Verification token
 */
userSchema.methods.generateVerificationToken = function () {
  // Generate random token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Hash token and save to database
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expiration (24 hours)
  this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

/**
 * Generate password reset token
 * @returns {String} - Reset token
 */
userSchema.methods.generateResetToken = function () {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and save to database
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiration (1 hour)
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

  return resetToken;
};

/**
 * Get user's full name
 * @returns {String} - Full name
 */
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
