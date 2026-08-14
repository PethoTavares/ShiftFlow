import { addDays } from "date-fns";

import { db } from "@/lib/db";

export async function getManagerDashboardData() {
  const now = new Date();
  const nextThirtyDays = addDays(now, 30);

  const [activeEmployees, upcomingEvents, upcomingShifts, openPositions, recentEvents, recentShifts] =
    await Promise.all([
      db.employee.count({ where: { status: "ACTIVE" } }),
      db.event.count({ where: { startDate: { gte: now }, status: { in: ["UPCOMING", "ACTIVE", "DRAFT"] } } }),
      db.shift.count({ where: { startTime: { gte: now }, status: { in: ["OPEN", "FULL", "IN_PROGRESS"] } } }),
      db.shift.aggregate({
        _sum: { requiredWorkers: true },
        where: { startTime: { gte: now, lte: nextThirtyDays }, status: { in: ["OPEN", "FULL", "IN_PROGRESS"] } },
      }),
      db.event.findMany({
        where: { startDate: { gte: now } },
        orderBy: { startDate: "asc" },
        take: 5,
        include: {
          shifts: {
            include: {
              assignments: true,
            },
          },
        },
      }),
      db.shift.findMany({
        where: { startTime: { gte: now } },
        orderBy: { startTime: "asc" },
        take: 6,
        include: {
          event: true,
          assignments: true,
        },
      }),
    ]);

  const openWorkerCount = recentShifts.reduce((sum, shift) => {
    const openPositionsForShift = Math.max(shift.requiredWorkers - shift.assignments.length, 0);
    return sum + openPositionsForShift;
  }, 0);

  return {
    stats: {
      activeEmployees,
      upcomingEvents,
      upcomingShifts,
      openPositions: openPositions._sum.requiredWorkers ?? openWorkerCount,
    },
    events: recentEvents,
    shifts: recentShifts,
  };
}

export async function getEmployeeDashboardData(employeeId: string) {
  const now = new Date();

  const assignments = await db.shiftAssignment.findMany({
    where: {
      employeeId,
      status: { in: ["ASSIGNED", "CONFIRMED"] },
      shift: {
        startTime: {
          gte: now,
        },
      },
    },
    orderBy: {
      shift: {
        startTime: "asc",
      },
    },
    include: {
      shift: {
        include: {
          event: true,
          assignments: true,
        },
      },
    },
  });

  return {
    assignments,
    nextAssignment: assignments[0] ?? null,
  };
}
