const prisma = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

exports.createLoanApplication = asyncHandler(async (req, res) => {
    const { marketplaceId, type, amount, downPayment, term, monthlyPayment } = req.body;
    const userId = req.user.userId;

    const application = await prisma.loanApplication.create({
        data: {
            userId,
            marketplaceId: marketplaceId || null,
            type, // MORTGAGE or AUTO_LOAN
            amount: parseFloat(amount),
            downPayment: parseFloat(downPayment),
            term: parseInt(term),
            monthlyPayment: parseFloat(monthlyPayment),
            status: 'PENDING'
        }
    });

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

// ADMIN: Get all applications
exports.getAllApplications = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const applications = await prisma.loanApplication.findMany({
        where: status ? { status } : {},
        include: {
            user: {
                select: { id: true, name: true, phone: true, email: true }
            },
            marketplace: {
                select: { id: true, name: true, image: true, category: true, price: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.json(applications);
});

// ADMIN: Approve or reject a loan application
exports.updateApplicationStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, adminNote } = req.body; // status: APPROVED | REJECTED

    if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Use APPROVED or REJECTED.' });
    }

    const application = await prisma.loanApplication.update({
        where: { id },
        data: { status, adminNote: adminNote || null },
        include: {
            user: { select: { id: true, name: true, email: true } }
        }
    });

    res.json(application);
});
