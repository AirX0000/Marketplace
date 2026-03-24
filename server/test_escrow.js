const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Creating mock escrow data for testing...');
  
  // Create test users if they don't exist
  let buyer = await prisma.user.findUnique({ where: { email: 'buyer@test.com' }});
  if (!buyer) {
    buyer = await prisma.user.create({
      data: {
        name: 'Test Buyer',
        email: 'buyer@test.com',
        phone: '+998901234567',
        password: 'hashedpassword',
        balance: 500000000
      }
    });
  }

  let seller = await prisma.user.findUnique({ where: { email: 'seller@test.com' }});
  if (!seller) {
    seller = await prisma.user.create({
      data: {
        name: 'Test Seller',
        email: 'seller@test.com',
        phone: '+998907654321',
        password: 'hashedpassword',
        balance: 10000000
      }
    });
  }

  // Create a mock transaction in ESCROW_HOLD
  const tx = await prisma.transaction.create({
    data: {
      senderId: buyer.id,
      receiverId: seller.id,
      type: 'PAYMENT',
      amount: 150000000,
      status: 'ESCROW_HOLD',
      description: 'DISPUTE: Buyer claims car has scratches'
    }
  });

  const tx2 = await prisma.transaction.create({
    data: {
      senderId: buyer.id,
      receiverId: seller.id,
      type: 'PAYMENT',
      amount: 45000000,
      status: 'ESCROW_HOLD',
      description: 'Awaiting buyer confirmation for Malibu'
    }
  });

  console.log(`Created test escrows: ${tx.id}, ${tx2.id}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
