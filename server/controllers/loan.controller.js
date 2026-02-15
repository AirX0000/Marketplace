const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { asyncHandler } = require('../middleware/errorHandler');

exports.createLoanApplication = asyncHandler(async (req, res) => {
    const { marketplaceId, type, amount, downPayment, term, monthlyPayment } = req.body;
    const userId = req.user.userId;

    const application = await prisma.loanApplication.create({
        data: {
            userId,
            marketplaceId,
            type, // MORTGAGE or AUTO_LOAN
            amount: parseFloat(amount),
            downPayment: parseFloat(downPayment),
            term: parseInt(term),
            monthlyPayment: parseFloat(monthlyPayment),
            status: 'PENDING' // Default
        }
    });

    // Mock automatic approval/rejection for demo
    // 80% chance of approval if amount < 1 billion
    setTimeout(async () => {
        const random = Math.random();
        const newStatus = (amount < 1000000000 && random > 0.2) ? 'APPROVED' : 'REJECTED';
        await prisma.loanApplication.update({
            where: { id: application.id },
            data: { status: newStatus }
        });
    }, 5000); // 5 seconds delay

    res.status(201).json(application);
});

exports.getMyApplications = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const applications = await prisma.loanApplication.findMany({
        where: { userId },
        include: {
            marketplace: {
                select: { id: true, name: true, image: true, category: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.json(applications);
});
