import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "../../src/lib/generated/prisma/client";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required for E2E setup.`);
  }

  return value;
}

async function main() {
  const databaseUrl = requireEnv("DATABASE_URL");

  const prisma = new PrismaClient({
    adapter: new PrismaPg(new Pool({ connectionString: databaseUrl })),
  });

  try {
    const manager = await prisma.user.findUnique({
      where: {
        email: "manager@shiftflow.dev",
      },
    });

    const passwordMatches = manager
      ? await bcrypt.compare("DevelopmentPassword123!", manager.passwordHash)
      : false;

    if (!manager || !passwordMatches) {
      throw new Error("E2E seed verification failed for manager@shiftflow.dev.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
