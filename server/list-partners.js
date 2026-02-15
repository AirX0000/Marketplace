const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listAllPartners() {
    console.log('📋 Список всех партнеров:\n');

    try {
        const partners = await prisma.user.findMany({
            where: {
                role: 'PARTNER'
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        });

        if (partners.length === 0) {
            console.log('❌ Партнеры не найдены');
            return;
        }

        partners.forEach((partner, index) => {
            console.log(`\n${index + 1}. ${partner.name || 'Без имени'}`);
            console.log(`   📧 Email: ${partner.email}`);
            console.log(`   🆔 ID: ${partner.id}`);
            console.log(`   📅 Создан: ${partner.createdAt.toLocaleDateString('ru-RU')}`);
        });

        console.log(`\n✅ Всего партнеров: ${partners.length}`);

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

listAllPartners();
