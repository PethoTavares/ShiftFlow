import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/shiftflow?schema=public",
      AUTH_SECRET: process.env.AUTH_SECRET ?? "e2e-auth-secret",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
    },
  },
});
