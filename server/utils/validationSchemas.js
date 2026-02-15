const { z } = require('zod');

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
    role: z.enum(['USER', 'PARTNER']).optional(),
    companyName: z.string().optional(),
    taxId: z.string().optional(),
    phone: z.string().optional(),
    businessDescription: z.string().optional(),
    businessCategory: z.string().optional(),
    businessAddress: z.string().optional()
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

module.exports = { registerSchema, loginSchema };
