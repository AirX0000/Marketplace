const express = require('express');
const router = express.Router();
const adminPartnersController = require('../controllers/admin-partners.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// All routes require admin role
router.use(authenticateToken, authorizeRole(['ADMIN']));

// Partner account management
router.get('/', adminPartnersController.getAllPartnerAccounts);
router.post('/', adminPartnersController.createPartnerAccount);
router.put('/:id', adminPartnersController.updatePartnerAccount);
router.delete('/:id', adminPartnersController.deletePartnerAccount);

module.exports = router;
