const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyToken, optionalToken, requireAdminOrOrganizer, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', optionalToken, eventController.getAllEvents);
router.get('/:id', optionalToken, eventController.getEventById);
router.post('/', verifyToken, requireAdminOrOrganizer, eventController.createEvent);
router.put('/:id', verifyToken, requireAdminOrOrganizer, eventController.updateEvent);
router.delete('/:id', verifyToken, requireAdmin, eventController.deleteEvent);

module.exports = router;
