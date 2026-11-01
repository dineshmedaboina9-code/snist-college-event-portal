const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { verifyToken, requireStudent, requireAdminOrOrganizer } = require('../middleware/authMiddleware');

router.post('/', verifyToken, requireStudent, registrationController.registerForEvent);
router.get('/my', verifyToken, requireStudent, registrationController.getMyRegistrations);
router.get('/event/:eventId', verifyToken, requireAdminOrOrganizer, registrationController.getEventRegistrations);
router.delete('/:id', verifyToken, registrationController.cancelRegistration);

module.exports = router;
