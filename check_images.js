const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const latest = await prisma.aidRequest.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  console.log("Latest Request Images:", latest?.images);
}
main().catch(console.error).finally(() => prisma.$disconnect());
