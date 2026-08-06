import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@yemeni-community.com";
  let password = process.env.ADMIN_PASSWORD_HASH;
  
  if (!password) {
    password = await bcrypt.hash("admin123", 12);
  }

  const admin = await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password,
      name: "مدير النظام",
    },
  });

  console.log("Admin seeded:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
