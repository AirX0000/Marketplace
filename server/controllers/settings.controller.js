const prisma = require('../config/database');
const env = require('../config/env');

exports.getSettings = async (req, res) => {
    try {
        const settingsList = await prisma.systemSetting.findMany();
        const settings = {};
        settingsList.forEach(s => {
            settings[s.key] = s.value;
        });
        settings.vapidPublicKey = env.vapidPublicKey;
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const updates = req.body;
        const operations = Object.entries(updates).map(([key, value]) => {
            return prisma.systemSetting.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) }
            });
        });

        await prisma.$transaction(operations);
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};
