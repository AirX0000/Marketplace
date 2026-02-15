const express = require('express');
const router = express.Router();
console.log('🔹 [NewsletterRoutes] Requiring controller...');
const newsletterController = require('../controllers/newsletter.controller');
console.log('🔹 [NewsletterRoutes] Requiring auth...');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
console.log('🔹 [NewsletterRoutes] Imports done.');

router.use(authenticateToken, authorizeRole(['ADMIN']));

router.post('/broadcast', newsletterController.sendBroadcast);
router.get('/stats', newsletterController.getStats);
router.get('/history', newsletterController.getHistory);

module.exports = router;
