import { execSync } from "node:child_process";

function runCommand(args: string[], databaseUrl: string) {
  execSync(args.join(" "), {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
    stdio: "inherit",
  });
}

export default async function setup() {
  const databaseUrl = process.env.E2E_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/shiftflow?schema=e2e";

  process.env.E2E_DATABASE_URL = databaseUrl;

  runCommand(["npm", "run", "db:migrate"], databaseUrl);
  runCommand(["npx", "tsx", "tests/e2e/prepare-db.ts"], databaseUrl);
}
