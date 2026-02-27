const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordReset.controller');

router.post('/send-otp', passwordResetController.sendOTP);
router.post('/verify-otp', passwordResetController.verifyOTP);
router.post('/reset-password', passwordResetController.resetPassword);

module.exports = router;
