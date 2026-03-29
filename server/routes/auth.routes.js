const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const rateLimit = require('express-rate-limit');
const { validate } = require('../middleware/validation');
const { registerSchema, loginSchema, otpSchema, verifyOtpSchema } = require('../validators/auth.validator');

// Rate limit for auth endpoints: 5 attempts per 15 minutes per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10, 
    message: { error: "Слишком много попыток. Пожалуйста, попробуйте позже через 15 минут." },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/send-otp', authLimiter, validate(otpSchema), authController.sendOTP);
router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), authController.verifyOTP);
router.post('/login-otp', authLimiter, authController.loginByOTP);

module.exports = router;
