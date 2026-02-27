const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { createLoanApplication, getMyApplications, getAllApplications, updateApplicationStatus } = require('../controllers/loan.controller');

router.post('/', authenticateToken, createLoanApplication);
router.get('/my', authenticateToken, getMyApplications);

// Admin routes
router.get('/admin/all', authenticateToken, requireAdmin, getAllApplications);
router.put('/admin/:id/status', authenticateToken, requireAdmin, updateApplicationStatus);

module.exports = router;
