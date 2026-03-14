const prisma = require('../config/database');

const kycCheck = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: { kyc: true }
        });

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        // Only enforce KYC for professional PARTNER roles
        if (user.role === 'PARTNER' && (!user.kyc || user.kyc.status !== 'APPROVED')) {
            return res.status(403).json({
                error: "Ваша учетная запись партнера еще не прошла верификацию (KYC). Действие заблокировано."
            });
        }

        next();
    } catch (error) {
        console.error("KYC Check Error:", error);
        res.status(500).json({ error: "Internal server error during KYC check" });
    }
};

module.exports = { kycCheck };
