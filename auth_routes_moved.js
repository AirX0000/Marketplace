const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validation');
const { registerSchema, loginSchema } = require('../utils/validationSchemas');

router.post('/register', validate(registerSchema), authController.register);

router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);


module.exports = router;
