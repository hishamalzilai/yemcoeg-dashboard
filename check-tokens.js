const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tokens = await prisma.deviceToken.findMany();
  console.log("Device tokens in DB:", tokens);
  
  const forms = await prisma.aidRequest.findMany();
  console.log("Aid requests in DB:", forms);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
