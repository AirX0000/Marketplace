const express = require('express');
const router = express.Router();
const centersController = require('../controllers/centers.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Public List (optional, but frontend calls it)
router.get('/', centersController.getCenters);

// Admin CRUD
router.post('/', authenticateToken, authorizeRole(['ADMIN']), centersController.createCenter);
router.put('/:id', authenticateToken, authorizeRole(['ADMIN']), centersController.updateCenter);
router.delete('/:id', authenticateToken, authorizeRole(['ADMIN']), centersController.deleteCenter);

module.exports = router;
