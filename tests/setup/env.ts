process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/shiftflow?schema=public";
process.env.AUTH_SECRET ??= "test-auth-secret";
process.env.NEXTAUTH_URL ??= "http://localhost:3000";
