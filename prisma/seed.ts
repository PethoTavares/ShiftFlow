import { addDays, addHours, startOfDay } from "date-fns";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient, EmployeeStatus, EventStatus, ShiftAssignmentStatus, ShiftStatus, UserRole } from "../src/lib/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run the seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString })),
});

async function main() {
  await prisma.shiftAssignment.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.event.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("DevelopmentPassword123!", 12);

  const manager = await prisma.user.create({
    data: {
      name: "Olivia Carter",
      email: "manager@shiftflow.dev",
      passwordHash,
      role: UserRole.MANAGER,
    },
  });

  const employeeSeeds = [
    ["Maya Thompson", "maya@shiftflow.dev", "206-555-0101"],
    ["Lucas Bennett", "lucas@shiftflow.dev", "206-555-0102"],
    ["Sophia Reed", "sophia@shiftflow.dev", "206-555-0103"],
    ["Ethan Brooks", "ethan@shiftflow.dev", "206-555-0104"],
    ["Ava Morgan", "ava@shiftflow.dev", "206-555-0105"],
    ["Noah Hayes", "noah@shiftflow.dev", "206-555-0106"],
    ["Isabella Cruz", "isabella@shiftflow.dev", "206-555-0107"],
    ["Mason Foster", "mason@shiftflow.dev", "206-555-0108"],
    ["Charlotte Nguyen", "charlotte@shiftflow.dev", "206-555-0109"],
    ["James Patel", "james@shiftflow.dev", "206-555-0110"],
  ] as const;

  const employees = [];

  for (const [name, email, phone] of employeeSeeds) {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: UserRole.EMPLOYEE,
        employee: {
          create: {
            phone,
            status: EmployeeStatus.ACTIVE,
          },
        },
      },
      include: {
        employee: true,
      },
    });

    if (user.employee) {
      employees.push(user.employee);
    }
  }

  const base = startOfDay(new Date("2026-08-17T00:00:00.000Z"));

  const events = await Promise.all([
    prisma.event.create({
      data: {
        name: "Vancouver Tech Conference",
        description: "Three-day technology conference with keynote, expo, and networking support.",
        location: "Vancouver Convention Centre",
        startDate: addDays(base, 4),
        endDate: addDays(base, 6),
        status: EventStatus.UPCOMING,
        createdById: manager.id,
      },
    }),
    prisma.event.create({
      data: {
        name: "Summer Music Festival",
        description: "Outdoor festival requiring gates, VIP, merch, and backstage staffing.",
        location: "Gas Works Park",
        startDate: addDays(base, 8),
        endDate: addDays(base, 9),
        status: EventStatus.UPCOMING,
        createdById: manager.id,
      },
    }),
    prisma.event.create({
      data: {
        name: "Corporate Leadership Summit",
        description: "Executive summit with registration, hospitality, and room turnover staffing.",
        location: "Seattle Grand Hotel",
        startDate: addDays(base, 13),
        endDate: addDays(base, 14),
        status: EventStatus.UPCOMING,
        createdById: manager.id,
      },
    }),
    prisma.event.create({
      data: {
        name: "Downtown Product Expo",
        description: "Product showcase with exhibitor support, registration, and logistics shifts.",
        location: "Bellevue Exhibition Hall",
        startDate: addDays(base, 18),
        endDate: addDays(base, 20),
        status: EventStatus.DRAFT,
        createdById: manager.id,
      },
    }),
  ]);

  const shiftSpecs = [
    [events[0].id, "Registration Setup", addHours(addDays(base, 4), 7), addHours(addDays(base, 4), 11), 4],
    [events[0].id, "Expo Floor Support", addHours(addDays(base, 4), 11), addHours(addDays(base, 4), 18), 5],
    [events[0].id, "Closing Breakdown", addHours(addDays(base, 6), 16), addHours(addDays(base, 6), 20), 3],
    [events[1].id, "Front Gate", addHours(addDays(base, 8), 10), addHours(addDays(base, 8), 16), 6],
    [events[1].id, "VIP Lounge", addHours(addDays(base, 8), 12), addHours(addDays(base, 8), 20), 3],
    [events[1].id, "Merch Tent", addHours(addDays(base, 9), 11), addHours(addDays(base, 9), 19), 4],
    [events[2].id, "Check-in Desk", addHours(addDays(base, 13), 7), addHours(addDays(base, 13), 13), 3],
    [events[2].id, "Speaker Support", addHours(addDays(base, 13), 12), addHours(addDays(base, 13), 18), 2],
    [events[2].id, "Hospitality", addHours(addDays(base, 14), 8), addHours(addDays(base, 14), 15), 4],
    [events[3].id, "Exhibitor Setup", addHours(addDays(base, 18), 7), addHours(addDays(base, 18), 12), 4],
    [events[3].id, "Floor Operations", addHours(addDays(base, 19), 9), addHours(addDays(base, 19), 17), 5],
    [events[3].id, "Load Out", addHours(addDays(base, 20), 15), addHours(addDays(base, 20), 20), 4],
  ] as const;

  const shifts = [];

  for (const [eventId, title, startTime, endTime, requiredWorkers] of shiftSpecs) {
    shifts.push(
      await prisma.shift.create({
        data: {
          eventId,
          title,
          description: `${title} staffing coverage`,
          startTime,
          endTime,
          requiredWorkers,
          status: ShiftStatus.OPEN,
        },
      }),
    );
  }

  let employeeIndex = 0;

  for (const shift of shifts) {
    const targetCount = Math.max(1, shift.requiredWorkers - 1);

    for (let count = 0; count < targetCount; count += 1) {
      const employee = employees[employeeIndex % employees.length];
      employeeIndex += 1;

      await prisma.shiftAssignment.create({
        data: {
          shiftId: shift.id,
          employeeId: employee.id,
          status: count % 2 === 0 ? ShiftAssignmentStatus.CONFIRMED : ShiftAssignmentStatus.ASSIGNED,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
