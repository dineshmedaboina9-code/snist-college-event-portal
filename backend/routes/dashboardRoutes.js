const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, requireAdminOrOrganizer } = require('../middleware/authMiddleware');

router.get('/stats', verifyToken, requireAdminOrOrganizer, dashboardController.getAdminDashboardStats);

module.exports = router;
