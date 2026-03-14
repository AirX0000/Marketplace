const express = require('express');
const router = express.Router();
const leadsController = require('../controllers/leads.controller');
const { protect, optionalProtect } = require('../middleware/auth');

// Public or optional protect for creating a lead
router.post('/', optionalProtect, leadsController.createLead);

// Protected routes for partners
router.get('/partner', protect, leadsController.getPartnerLeads);
router.patch('/:id/status', protect, leadsController.updateLeadStatus);

module.exports = router;
