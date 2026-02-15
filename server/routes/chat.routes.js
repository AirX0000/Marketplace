const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticateToken } = require('../middleware/auth');

router.get('/rooms', authenticateToken, chatController.getRooms);
router.get('/rooms/:roomId/messages', authenticateToken, chatController.getMessages);
router.post('/initiate', authenticateToken, chatController.initiateChat);

module.exports = router;
