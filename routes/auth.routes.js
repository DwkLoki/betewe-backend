const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/user/me', authenticateToken, authController.getMe);
router.put('/user/me', authenticateToken, authController.updateMe);
router.post('/user/profile-picture', authenticateToken, authController.uploadProfilePicture);

module.exports = router;
