const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', settingsController.getSettings);
router.post('/', authenticateToken, requireAdmin, settingsController.updateSettings);

module.exports = router;
