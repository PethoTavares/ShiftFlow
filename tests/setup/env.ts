process.env.TEST_DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/shiftflow?schema=vitest";
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.AUTH_SECRET ??= "test-auth-secret";
process.env.NEXTAUTH_URL ??= "http://localhost:3000";
