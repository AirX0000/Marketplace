const prisma = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

exports.createLead = asyncHandler(async (req, res) => {
    const { name, phone, message, marketplaceId, partnerId, preferredDate } = req.body;
    const userId = req.user?.id;

    if (!name || !phone || !marketplaceId || !partnerId) {
        return res.status(400).json({ error: 'Name, phone, marketplaceId, and partnerId are required' });
    }

    const lead = await prisma.serviceLead.create({
        data: {
            name,
            phone,
            message,
            preferredDate: preferredDate ? new Date(preferredDate) : null,
            marketplaceId,
            partnerId,
            userId
        }
    });

    res.status(201).json(lead);
});

exports.getPartnerLeads = asyncHandler(async (req, res) => {
    const partnerId = req.user.id;

    const leads = await prisma.serviceLead.findMany({
        where: { partnerId },
        include: {
            marketplace: {
                select: {
                    name: true,
                    image: true
                }
            },
            user: {
                select: {
                    name: true,
                    email: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.json(leads);
});

exports.updateLeadStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const partnerId = req.user.id;

    const lead = await prisma.serviceLead.findFirst({
        where: { id, partnerId }
    });

    if (!lead) {
        return res.status(404).json({ error: 'Lead not found or unauthorized' });
    }

    const updatedLead = await prisma.serviceLead.update({
        where: { id },
        data: { status }
    });

    res.json(updatedLead);
});
