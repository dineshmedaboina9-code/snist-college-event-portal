const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', authController.registerStudent);
router.post('/login', authController.loginStudent);
router.post('/admin/login', authController.loginAdmin);
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router;
