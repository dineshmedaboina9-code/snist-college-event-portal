const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken, requireAdminOrOrganizer } = require('../middleware/authMiddleware');

router.post('/verify', verifyToken, requireAdminOrOrganizer, attendanceController.verifyQrToken);
router.post('/check-in', verifyToken, requireAdminOrOrganizer, attendanceController.checkInStudent);
router.get('/report/:eventId', verifyToken, requireAdminOrOrganizer, attendanceController.getEventAttendanceReport);

module.exports = router;
