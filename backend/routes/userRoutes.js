/**
 * User Routes
 * Routes for user profile management
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(protect);

// Profile management
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);

// Profile picture (two options: URL or file upload)
router.post('/profile-picture', userController.uploadProfilePicture);
router.post('/upload-picture', upload.single('profilePicture'), userController.uploadPictureFile);

router.delete('/account', userController.deleteAccount);

// User statistics
router.get('/stats', userController.getUserStats);

module.exports = router;
