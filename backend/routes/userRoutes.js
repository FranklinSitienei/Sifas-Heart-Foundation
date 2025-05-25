const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/auth');
const { avatarUpload } = require('../config/cloudinary');

router.put('/avatar', authMiddleware, avatarUpload.single('avatar'), userController.uploadAvatar);

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/oauth', userController.oauthLogin); // Google/Apple

router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.delete('/profile', authMiddleware, userController.deleteAccount);
router.get('/donations', authMiddleware, userController.getUserDonations);
router.get('/notifications', authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json(user.notifications.reverse().slice(0, 20));
  });
  

module.exports = router;
