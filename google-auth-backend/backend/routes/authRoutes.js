const express = require('express');
const auth = require('../middleware/authMiddleware');
const { googleLogin, getProfile, logout } = require('../controllers/authController');

const router = express.Router();
router.post('/google', googleLogin);
router.get('/profile', auth, getProfile);
router.post('/logout', auth, logout);

module.exports = router;
