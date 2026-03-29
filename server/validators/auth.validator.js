const { z } = require('zod');

const registerSchema = z.object({
    phone: z.string().min(9, "Phone number is too short").max(20),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Name is too short"),
    role: z.enum(['USER', 'PARTNER']).optional()
});

const loginSchema = z.object({
    identifier: z.string().min(1, "Phone or Email is required"),
    password: z.string().min(1, "Password is required")
});

const otpSchema = z.object({
    phone: z.string().min(9, "Phone number is too short")
});

const verifyOtpSchema = z.object({
    phone: z.string(),
    code: z.string().length(4, "OTP must be 4 digits")
});

module.exports = {
    registerSchema,
    loginSchema,
    otpSchema,
    verifyOtpSchema
};
