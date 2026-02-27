const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.get('/', settingsController.getSettings);
router.post('/', authenticateToken, isAdmin, settingsController.updateSettings);

module.exports = router;
