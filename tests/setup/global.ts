import { execSync } from "node:child_process";

function runPrisma(command: string, databaseUrl: string) {
  execSync(`npx prisma ${command}`, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
    stdio: "inherit",
  });
}

export default function setup() {
  const databaseUrl = process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/shiftflow?schema=vitest";

  process.env.TEST_DATABASE_URL = databaseUrl;
  process.env.DATABASE_URL = databaseUrl;

  runPrisma("migrate deploy", databaseUrl);
}
