import { addDays } from "date-fns";

import { db } from "@/lib/db";
import { ACTIVE_ASSIGNMENT_STATUSES, isAssignmentActive } from "@/features/assignments/utils";

type ShiftWithAssignments = {
  requiredWorkers: number;
  assignments: { status: "ASSIGNED" | "CONFIRMED" | "DECLINED" | "COMPLETED" | "CANCELLED" }[];
};

export function calculateOpenPositions(shifts: ShiftWithAssignments[]) {
  return shifts.reduce((sum, shift) => {
    const activeAssignmentCount = shift.assignments.filter((assignment) => isAssignmentActive(assignment.status)).length;
    const openPositionsForShift = Math.max(shift.requiredWorkers - activeAssignmentCount, 0);
    return sum + openPositionsForShift;
  }, 0);
}

export async function getManagerDashboardData() {
  const now = new Date();
  const nextThirtyDays = addDays(now, 30);

  const [activeEmployees, upcomingEvents, upcomingShifts, recentEvents, recentShifts] =
    await Promise.all([
      db.employee.count({ where: { status: "ACTIVE" } }),
      db.event.count({ where: { startDate: { gte: now }, status: { in: ["UPCOMING", "ACTIVE", "DRAFT"] } } }),
      db.shift.count({
        where: {
          startTime: { gte: now },
          status: { in: ["OPEN", "FULL", "IN_PROGRESS"] },
          event: {
            status: {
              in: ["DRAFT", "UPCOMING", "ACTIVE"],
            },
          },
        },
      }),
      db.event.findMany({
        where: { startDate: { gte: now }, status: { in: ["DRAFT", "UPCOMING", "ACTIVE"] } },
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
        where: {
          startTime: { gte: now, lte: nextThirtyDays },
          status: { in: ["OPEN", "FULL", "IN_PROGRESS"] },
          event: {
            status: {
              in: ["DRAFT", "UPCOMING", "ACTIVE"],
            },
          },
        },
        orderBy: { startTime: "asc" },
        take: 6,
        include: {
          event: true,
          assignments: true,
        },
      }),
    ]);

  const openWorkerCount = calculateOpenPositions(recentShifts);

  return {
    stats: {
      activeEmployees,
      upcomingEvents,
      upcomingShifts,
      openPositions: openWorkerCount,
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
      status: { in: ACTIVE_ASSIGNMENT_STATUSES },
      shift: {
        startTime: {
          gte: now,
        },
        status: {
          in: ["OPEN", "FULL", "IN_PROGRESS"],
        },
        event: {
          status: {
            in: ["DRAFT", "UPCOMING", "ACTIVE"],
          },
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
