const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminMiddleware } = require('../middlewares/admin');
const { avatarUpload } = require('../config/cloudinary');

router.put('/avatar', adminMiddleware, avatarUpload.single('avatar'), adminController.uploadAvatar);

// All routes below require valid admin token
router.use(adminMiddleware);

router.get('/profile', adminController.getProfile);
router.put('/profile', adminController.updateProfile);
router.put('/avatar', adminController.uploadAvatar);
router.put('/notifications', adminController.updateNotifications);
router.put('/password', adminController.changePassword);
router.put('/toggle-2fa', adminController.toggleTwoFactor);
router.put('/deactivate', adminController.deactivateAccount);
router.get('/donations', adminController.getAllDonations);

module.exports = router;
