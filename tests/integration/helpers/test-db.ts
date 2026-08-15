import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import {
  PrismaClient,
  type EmployeeStatus,
  type EventStatus,
  type ShiftStatus,
  type UserRole,
} from "../../../src/lib/generated/prisma/client";

const connectionString =
  process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/shiftflow?schema=vitest";
const pool = new Pool({ connectionString });

export const testDb = new PrismaClient({
  adapter: new PrismaPg(pool),
});

export async function resetDatabase() {
  await testDb.$executeRawUnsafe(
    'TRUNCATE TABLE "ShiftAssignment", "Shift", "Event", "Employee", "User" RESTART IDENTITY CASCADE',
  );
}

export async function disconnectTestDb() {
  await testDb.$disconnect();
  await pool.end();
}

export async function createUser({
  name,
  email,
  password = "DevelopmentPassword123!",
  role = "MANAGER",
}: {
  name: string;
  email: string;
  password?: string;
  role?: UserRole;
}) {
  const passwordHash = await hash(password, 12);

  return testDb.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
    },
  });
}

export async function createEmployeeRecord({
  name,
  email,
  password = "DevelopmentPassword123!",
  status = "ACTIVE",
  phone = "206-555-0199",
}: {
  name: string;
  email: string;
  password?: string;
  status?: EmployeeStatus;
  phone?: string;
}) {
  const passwordHash = await hash(password, 12);

  return testDb.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "EMPLOYEE",
      employee: {
        create: {
          status,
          phone,
        },
      },
    },
    include: {
      employee: true,
    },
  });
}

export async function createEventRecord({
  name = "Test Event",
  status = "UPCOMING",
  createdById,
  startDate = new Date("2026-08-20T08:00:00.000Z"),
  endDate = new Date("2026-08-20T18:00:00.000Z"),
}: {
  name?: string;
  status?: EventStatus;
  createdById: string;
  startDate?: Date;
  endDate?: Date;
}) {
  return testDb.event.create({
    data: {
      name,
      description: `${name} description`,
      location: "Seattle",
      status,
      createdById,
      startDate,
      endDate,
    },
  });
}

export async function createShiftRecord({
  eventId,
  title = "Test Shift",
  status = "OPEN",
  requiredWorkers = 1,
  startTime = new Date("2026-08-20T09:00:00.000Z"),
  endTime = new Date("2026-08-20T13:00:00.000Z"),
}: {
  eventId: string;
  title?: string;
  status?: ShiftStatus;
  requiredWorkers?: number;
  startTime?: Date;
  endTime?: Date;
}) {
  return testDb.shift.create({
    data: {
      eventId,
      title,
      description: `${title} description`,
      status,
      requiredWorkers,
      startTime,
      endTime,
    },
  });
}
