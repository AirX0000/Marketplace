const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticateToken } = require('../middleware/auth');

router.post('/chat', aiController.chat);
router.post('/generate-description', authenticateToken, aiController.generateDescription);

module.exports = router;
