const express = require('express');
const router = express.Router();
const returnController = require('../controllers/return.controller');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, returnController.createRequest);
router.get('/my', authenticateToken, returnController.getUserRequests);
router.put('/:id/status', authenticateToken, returnController.updateRequestStatus);

module.exports = router;
