const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { asyncHandler } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

// Get all partner accounts (admin only)
exports.getAllPartnerAccounts = asyncHandler(async (req, res) => {
    const partners = await prisma.user.findMany({
        where: { role: 'PARTNER' },
        select: {
            id: true,
            email: true,
            name: true,
            storeName: true,
            storeDescription: true,
            storeColor: true,
            createdAt: true,
            _count: {
                select: { marketplaces: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.json({ partners });
});

// Create new partner account (admin only)
exports.createPartnerAccount = asyncHandler(async (req, res) => {
    const { email, password, name, storeName, storeDescription, storeColor } = req.body;

    // Validation
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create partner
    const partner = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name: name || 'Partner',
            role: 'PARTNER',
            storeName: storeName || null,
            storeDescription: storeDescription || null,
            storeColor: storeColor || '#3b82f6'
        },
        select: {
            id: true,
            email: true,
            name: true,
            storeName: true,
            createdAt: true
        }
    });

    res.status(201).json({ partner, message: 'Partner created successfully' });
});

// Update partner account (admin only)
exports.updatePartnerAccount = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email, password, name, storeName, storeDescription, storeColor } = req.body;

    // Check if partner exists
    const partner = await prisma.user.findUnique({ where: { id } });
    if (!partner || partner.role !== 'PARTNER') {
        return res.status(404).json({ error: 'Partner not found' });
    }

    // Check if new email already exists (if changing email)
    if (email && email !== partner.email) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: 'Email already exists' });
        }
    }

    // Prepare update data
    const updateData = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (storeName !== undefined) updateData.storeName = storeName;
    if (storeDescription !== undefined) updateData.storeDescription = storeDescription;
    if (storeColor) updateData.storeColor = storeColor;

    // Hash new password if provided
    if (password) {
        updateData.password = await bcrypt.hash(password, 10);
    }

    // Update partner
    const updated = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
            id: true,
            email: true,
            name: true,
            storeName: true,
            storeDescription: true,
            storeColor: true
        }
    });

    res.json({ partner: updated, message: 'Partner updated successfully' });
});

// Delete partner account (admin only)
exports.deletePartnerAccount = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if partner exists
    const partner = await prisma.user.findUnique({ where: { id } });
    if (!partner || partner.role !== 'PARTNER') {
        return res.status(404).json({ error: 'Partner not found' });
    }

    // Delete partner (cascade will handle related data)
    await prisma.user.delete({ where: { id } });

    res.json({ message: 'Partner deleted successfully' });
});
