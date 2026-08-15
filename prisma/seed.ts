import { seedDatabase } from "./seed-data";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run the seed.");
}

seedDatabase(connectionString).catch(async (error) => {
    console.error(error);
    process.exit(1);
  });
