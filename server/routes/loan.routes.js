const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { createLoanApplication, getMyApplications } = require('../controllers/loan.controller');

router.post('/', authenticateToken, createLoanApplication);
router.get('/my', authenticateToken, getMyApplications);

module.exports = router;
