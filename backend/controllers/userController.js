/**
 * User Controller
 * Handles user profile management requests
 */

const userService = require('../services/userService');

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, autoCompound } = req.body;

    const result = await userService.updateProfile(req.user._id, {
      firstName,
      lastName,
      autoCompound,
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update profile',
    });
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
    }

    const result = await userService.changePassword(
      req.user._id,
      currentPassword,
      newPassword
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to change password',
    });
  }
};

/**
 * @desc    Upload profile picture
 * @route   POST /api/users/profile-picture
 * @access  Private
 */
exports.uploadProfilePicture = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide image URL',
      });
    }

    const result = await userService.updateProfilePicture(
      req.user._id,
      imageUrl
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to upload profile picture',
    });
  }
};

/**
 * @desc    Upload profile picture file
 * @route   POST /api/users/upload-picture
 * @access  Private
 */
exports.uploadPictureFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file',
      });
    }

    // Convert buffer to base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const cloudinary = require('../config/cloudinary');
    const uploadResult = await cloudinary.uploadImage(base64Image, 'profile-pictures');

    // Update user profile
    const result = await userService.updateProfilePicture(
      req.user._id,
      uploadResult.url
    );

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        user: result.user,
        imageUrl: uploadResult.url,
      },
    });
  } catch (error) {
    console.error('Upload picture file error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image',
    });
  }
};

/**
 * @desc    Delete/Deactivate account
 * @route   DELETE /api/users/account
 * @access  Private
 */
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your password to confirm',
      });
    }

    const result = await userService.deleteAccount(req.user._id, password);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete account',
    });
  }
};

/**
 * @desc    Get user statistics
 * @route   GET /api/users/stats
 * @access  Private
 */
exports.getUserStats = async (req, res) => {
  try {
    const stats = await userService.getUserStats(req.user._id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user statistics',
    });
  }
};
