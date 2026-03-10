const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { ValidationError, AuthenticationError } = require('../utils/errors');
const env = require('../config/env');

class AuthService {
    async register(userData) {
        const { email, password, name, role, companyName, taxId, phone, businessCategory, businessAddress, businessDescription } = userData;

        const normalizedEmail = email ? email.toLowerCase().trim() : undefined;
        const normalizedPhone = phone ? phone.replace(/\D/g, '') : undefined;

        if (!normalizedPhone) {
            throw new ValidationError('Phone number is required');
        }

        // Check existing user by email or phone
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    normalizedEmail ? { email: { equals: normalizedEmail, mode: 'insensitive' } } : undefined,
                    { phone: normalizedPhone }
                ].filter(Boolean)
            }
        });

        if (existingUser) {
            if (normalizedEmail && existingUser.email?.toLowerCase() === normalizedEmail) {
                throw new ValidationError('Email already registered');
            }
            if (existingUser.phone === normalizedPhone) {
                throw new ValidationError('Phone number already registered');
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Prepare User Data
        const data = {
            email: normalizedEmail || null,
            password: hashedPassword,
            name,
            role: role || 'USER',
            phone: normalizedPhone,

            // Partner Fields
            companyName: role === 'PARTNER' ? companyName : undefined,
            taxId: role === 'PARTNER' ? taxId : undefined,
            businessCategory: role === 'PARTNER' ? businessCategory : undefined,
            businessAddress: role === 'PARTNER' ? businessAddress : undefined,
            businessDescription: role === 'PARTNER' ? businessDescription : undefined
        };

        // Generate sequential accountId starting from 1
        const allUsers = await prisma.user.findMany({ select: { accountId: true } });
        let maxId = 0;
        for (const u of allUsers) {
            if (u.accountId) {
                const numericId = parseInt(u.accountId, 10);
                if (!isNaN(numericId) && numericId > maxId) {
                    maxId = numericId;
                }
            }
        }
        const accountId = (maxId + 1).toString();

        const user = await prisma.user.create({ data: { ...data, accountId } });

        const token = jwt.sign(
            { userId: user.id, email: user.email, phone: user.phone, role: user.role },
            env.jwtSecret,
            { expiresIn: '24h' }
        );

        return {
            message: "User registered successfully",
            user: { id: user.id, email: user.email, phone: user.phone, role: user.role, name: user.name },
            token
        };
    }

    async login({ identifier, password }) {
        // Normalize input identifier
        const isEmail = identifier.includes('@');
        const normalizedIdentifier = isEmail ? identifier.toLowerCase().trim() : identifier.replace(/\D/g, '');

        // Try finding user by email or phone
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: { equals: normalizedIdentifier, mode: 'insensitive' } },
                    { phone: normalizedIdentifier }
                ]
            }
        });

        if (!user) {
            throw new AuthenticationError('Invalid email/phone or password');
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            throw new AuthenticationError('Invalid email/phone or password');
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            env.jwtSecret,
            { expiresIn: '24h' }
        );

        return {
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                hasMarketplace: user.role === 'PARTNER' // basic check, refined later if needed
            },
            token
        };
    }
}

module.exports = new AuthService();
