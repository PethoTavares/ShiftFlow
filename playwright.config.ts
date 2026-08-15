import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    env: {
      DATABASE_URL: process.env.E2E_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/shiftflow?schema=e2e",
      AUTH_SECRET: process.env.AUTH_SECRET ?? "e2e-auth-secret",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
    },
  },
});
