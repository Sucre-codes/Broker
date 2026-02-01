/**
 * User Service
 * Handles user profile management, updates, and settings
 */

const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Update user profile
 * @param {String} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} - Updated user
 */
exports.updateProfile = async (userId, updateData) => {
  const { firstName, lastName, autoCompound } = updateData;

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Update allowed fields
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (typeof autoCompound !== 'undefined') user.autoCompound = autoCompound;

    await user.save();

    // Remove password from response
    user.password = undefined;

    return {
      user,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

/**
 * Change user password
 * @param {String} userId - User ID
 * @param {String} currentPassword - Current password
 * @param {String} newPassword - New password
 * @returns {Object} - Success message
 */
exports.changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Get user with password
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters');
    }

    if (newPassword === currentPassword) {
      throw new Error('New password must be different from current password');
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    return {
      message: 'Password changed successfully',
    };
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

/**
 * Update profile picture
 * @param {String} userId - User ID
 * @param {String} imageUrl - Cloudinary image URL
 * @returns {Object} - Updated user
 */
exports.updateProfilePicture = async (userId, imageUrl) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    user.profilePicture = imageUrl;
    await user.save();

    return {
      user,
      message: 'Profile picture updated successfully',
    };
  } catch (error) {
    console.error('Update profile picture error:', error);
    throw error;
  }
};

/**
 * Delete/Deactivate user account
 * @param {String} userId - User ID
 * @param {String} password - Password for confirmation
 * @returns {Object} - Success message
 */
exports.deleteAccount = async (userId, password) => {
  try {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new Error('Incorrect password');
    }

    // Deactivate instead of delete (for data integrity)
    user.isActive = false;
    await user.save();

    return {
      message: 'Account deactivated successfully',
    };
  } catch (error) {
    console.error('Delete account error:', error);
    throw error;
  }
};

/**
 * Get user statistics
 * @param {String} userId - User ID
 * @returns {Object} - User statistics
 */
exports.getUserStats = async (userId) => {
  const Investment = require('../models/Investment');
  const Transaction = require('../models/Transaction');

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Get investment counts
    const totalInvestments = await Investment.countDocuments({ user: userId });
    const activeInvestments = await Investment.countDocuments({
      user: userId,
      status: 'active',
    });
    const completedInvestments = await Investment.countDocuments({
      user: userId,
      status: 'completed',
    });

    // Get transaction counts
    const totalTransactions = await Transaction.countDocuments({ user: userId });
    const deposits = await Transaction.countDocuments({
      user: userId,
      type: 'deposit',
    });
    const withdrawals = await Transaction.countDocuments({
      user: userId,
      type: 'withdrawal',
    });

    return {
      user: {
        fullName: user.fullName,
        email: user.email,
        joinedDate: user.createdAt,
        isVerified: user.isVerified,
      },
      investments: {
        total: totalInvestments,
        active: activeInvestments,
        completed: completedInvestments,
      },
      transactions: {
        total: totalTransactions,
        deposits,
        withdrawals,
      },
      financials: {
        totalInvested: user.totalInvested,
        currentBalance: user.currentBalance,
        totalReturns: user.totalReturns,
      },
    };
  } catch (error) {
    console.error('Get user stats error:', error);
    throw error;
  }
};
