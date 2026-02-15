const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', supportController.getTickets);
router.post('/', supportController.createTicket);
router.get('/:id', supportController.getTicketById);
router.post('/:id/reply', supportController.replyTicket);
router.put('/:id/status', supportController.updateStatus);

module.exports = router;
