const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { ValidationError, AuthenticationError } = require('../utils/errors');
const env = require('../config/env');

class AuthService {
    async register(userData) {
        const { email, password, name, role, companyName, taxId, phone, businessCategory, businessAddress, businessDescription } = userData;

        // Check existing user
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new ValidationError('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Prepare User Data
        const data = {
            email,
            password: hashedPassword,
            name,
            role: role || 'USER',

            // Partner Fields
            companyName: role === 'PARTNER' ? companyName : undefined,
            taxId: role === 'PARTNER' ? taxId : undefined,
            phone: role === 'PARTNER' ? phone : undefined,
            businessCategory: role === 'PARTNER' ? businessCategory : undefined,
            businessAddress: role === 'PARTNER' ? businessAddress : undefined,
            businessDescription: role === 'PARTNER' ? businessDescription : undefined
        };

        const user = await prisma.user.create({ data });

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            env.jwtSecret,
            { expiresIn: '24h' }
        );

        return {
            message: "User registered successfully",
            user: { id: user.id, email: user.email, role: user.role, name: user.name },
            token
        };
    }

    async login({ email, password }) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new AuthenticationError('Invalid email or password');
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            throw new AuthenticationError('Invalid email or password');
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
