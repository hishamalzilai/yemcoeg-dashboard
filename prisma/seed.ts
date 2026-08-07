import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = await bcrypt.hash("123456", 12);

  const superadmin = await prisma.admin.upsert({
    where: { email: "admin@yemeni.community" },
    update: {},
    create: {
      email: "admin@yemeni.community",
      password: defaultPassword,
      name: "مدير عام",
      role: "superadmin"
    },
  });

  const aidAdmin = await prisma.admin.upsert({
    where: { email: "aid@yemeni.community" },
    update: {},
    create: {
      email: "aid@yemeni.community",
      password: defaultPassword,
      name: "مشرف المساعدات",
      role: "aid_admin"
    },
  });

  const newsAdmin = await prisma.admin.upsert({
    where: { email: "news@yemeni.community" },
    update: {},
    create: {
      email: "news@yemeni.community",
      password: defaultPassword,
      name: "مشرف الأخبار",
      role: "news_admin"
    },
  });

  console.log("Seeded admins:", [superadmin.email, aidAdmin.email, newsAdmin.email]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
