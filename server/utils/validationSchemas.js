const { z } = require('zod');

const registerSchema = z.object({
    email: z.string().email().optional().or(z.literal('')),
    password: z.string().min(6),
    name: z.string().optional(),
    role: z.enum(['USER', 'PARTNER']).optional(),
    companyName: z.string().optional(),
    taxId: z.string().optional(),
    phone: z.string().min(9, 'Phone number is required for registration'),
    businessDescription: z.string().optional(),
    businessCategory: z.string().optional(),
    businessAddress: z.string().optional()
});

const loginSchema = z.object({
    identifier: z.string().min(1),
    password: z.string()
});

module.exports = { registerSchema, loginSchema };
