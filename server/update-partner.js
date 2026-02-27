const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updatePartnerCredentials() {
    console.log('🔐 Обновление учетных данных партнера...\n');

    // Настройте здесь новые данные
    const OLD_EMAIL = 'partner@aura.com';  // Старый email
    const NEW_EMAIL = 'newpartner@example.com';  // Новый email
    const NEW_PASSWORD = 'newpassword123';  // Новый пароль

    try {
        // Найти партнера по старому email
        const partner = await prisma.user.findUnique({
            where: { email: OLD_EMAIL }
        });

        if (!partner) {
            console.log(`❌ Партнер с email ${OLD_EMAIL} не найден`);
            return;
        }

        // Хэшировать новый пароль
        const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

        // Обновить данные
        const updated = await prisma.user.update({
            where: { email: OLD_EMAIL },
            data: {
                email: NEW_EMAIL,
                password: hashedPassword
            }
        });

        console.log('✅ Учетные данные успешно обновлены!\n');
        console.log('📧 Новый Email:', NEW_EMAIL);
        console.log('🔑 Новый Пароль:', NEW_PASSWORD);
        console.log('👤 Роль:', updated.role);
        console.log('📛 Имя:', updated.name);

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

updatePartnerCredentials();
