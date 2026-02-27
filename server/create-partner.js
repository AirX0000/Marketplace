const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createNewPartner() {
    console.log('👤 Создание нового партнера...\n');

    // Настройте данные нового партнера здесь
    const PARTNER_DATA = {
        email: 'entrepreneur@example.com',
        password: 'secure123',
        name: 'Новый Предприниматель',
        role: 'PARTNER'
    };

    try {
        // Проверить существует ли уже
        const existing = await prisma.user.findUnique({
            where: { email: PARTNER_DATA.email }
        });

        if (existing) {
            console.log(`⚠️  Пользователь с email ${PARTNER_DATA.email} уже существует`);
            console.log('Используйте update-partner.js для обновления\n');
            return;
        }

        // Хэшировать пароль
        const hashedPassword = await bcrypt.hash(PARTNER_DATA.password, 10);

        // Создать партнера
        const partner = await prisma.user.create({
            data: {
                email: PARTNER_DATA.email,
                password: hashedPassword,
                name: PARTNER_DATA.name,
                role: PARTNER_DATA.role
            }
        });

        console.log('✅ Партнер успешно создан!\n');
        console.log('📧 Email:', PARTNER_DATA.email);
        console.log('🔑 Пароль:', PARTNER_DATA.password);
        console.log('👤 Роль:', partner.role);
        console.log('📛 Имя:', partner.name);
        console.log('🆔 ID:', partner.id);

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createNewPartner();
