/**
 * Authentication Service
 * Contains all business logic for user authentication
 */

const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('./emailService');

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Object} - User object and token
 */
exports.registerUser = async (userData) => {
  const { firstName, lastName, email, password } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
  });

  // Generate verification token
  const verificationToken = user.generateVerificationToken();
  await user.save();

  // Send verification email
  try {
    await emailService.sendVerificationEmail(user, verificationToken);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Continue even if email fails
  }

  // Generate auth token
  const token = user.generateAuthToken();

  // Remove password from response
  user.password = undefined;

  return {
    user,
    token,
    message: 'Registration successful. Please check your email to verify your account.',
  };
};

/**
 * Login user
 * @param {String} email - User email
 * @param {String} password - User password
 * @returns {Object} - User object and token
 */
exports.loginUser = async (email, password) => {
  // Validate input
  if (!email || !password) {
    throw new Error('Please provide email and password');
  }

  // Find user and include password
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check if account is active
  if (!user.isActive) {
    throw new Error('Your account has been deactivated. Please contact support.');
  }

  // Verify password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    throw new Error('Invalid credentials');
  }

  // Generate token
  const token = user.generateAuthToken();

  // Remove password from response
  user.password = undefined;

  return {
    user,
    token,
    message: 'Login successful',
  };
};

/**
 * Verify email with token
 * @param {String} token - Verification token
 * @returns {Object} - User object
 */
exports.verifyEmail = async (token) => {
  // Hash the token to match database
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid token
  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error('Invalid or expired verification token');
  }

  // Update user
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;
  await user.save();

  // Send welcome email
  try {
    await emailService.sendWelcomeEmail(user);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }

  return {
    user,
    message: 'Email verified successfully',
  };
};

/**
 * Request password reset
 * @param {String} email - User email
 * @returns {String} - Success message
 */
exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Don't reveal if email exists
    return {
      message: 'If an account exists with this email, a password reset link has been sent.',
    };
  }

  // Generate reset token
  const resetToken = user.generateResetToken();
  await user.save();

  // Send password reset email
  try {
    await emailService.sendPasswordResetEmail(user, resetToken);
  } catch (error) {
    // Reset token fields if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    throw new Error('Email could not be sent');
  }

  return {
    message: 'Password reset email sent',
  };
};

/**
 * Reset password with token
 * @param {String} token - Reset token
 * @param {String} newPassword - New password
 * @returns {Object} - Success message
 */
exports.resetPassword = async (token, newPassword) => {
  // Hash token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  // Set new password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Generate new auth token
  const authToken = user.generateAuthToken();

  return {
    token: authToken,
    message: 'Password reset successful',
  };
};

/**
 * Resend verification email
 * @param {String} email - User email
 * @returns {String} - Success message
 */
exports.resendVerification = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.isVerified) {
    throw new Error('Email already verified');
  }

  // Generate new verification token
  const verificationToken = user.generateVerificationToken();
  await user.save();

  // Send verification email
  await emailService.sendVerificationEmail(user, verificationToken);

  return {
    message: 'Verification email sent',
  };
};

/**
 * Get current user profile
 * @param {String} userId - User ID
 * @returns {Object} - User object
 */
exports.getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};
