const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.user.findMany({
    where: { phone: { contains: '935179146' } }
  });
  console.log(users.map(u => ({ id: u.id, phone: u.phone })));
  const otp = await prisma.oTP.findMany({
    where: { phone: { contains: '935179146' } }
  });
  console.log(otp.map(o => ({ phone: o.phone, code: o.code })));
}
run();
