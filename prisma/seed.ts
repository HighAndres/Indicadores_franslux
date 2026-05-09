import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const passwordHash = await bcrypt.hash("Cambiar123!", 10);

  const client = await prisma.client.upsert({
    where: {
      slug: "franslux",
    },
    update: {
      name: "FRANSLUX",
      logoUrl: "/brand/franslux-logo.png",
      color: "#A9945D",
      isActive: true,
    },
    create: {
      name: "FRANSLUX",
      slug: "franslux",
      logoUrl: "/brand/franslux-logo.png",
      color: "#A9945D",
      isActive: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@franslux.com",
    },
    update: {
      name: "Administrador FRANSLUX",
      passwordHash,
      role: Role.CLIENT_ADMIN,
      isActive: true,
      clientId: client.id,
    },
    create: {
      name: "Administrador FRANSLUX",
      email: "admin@franslux.com",
      passwordHash,
      role: Role.CLIENT_ADMIN,
      isActive: true,
      clientId: client.id,
    },
  });

  console.log("Seed completado correctamente.");
  console.log({
    client: client.name,
    admin: admin.email,
    password: "Cambiar123!",
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
