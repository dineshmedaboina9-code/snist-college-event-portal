const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken, requireStudent } = require('../middleware/authMiddleware');

router.get('/', verifyToken, requireStudent, notificationController.getMyNotifications);
router.put('/:notification_id/read', verifyToken, requireStudent, notificationController.markAsRead);

module.exports = router;
