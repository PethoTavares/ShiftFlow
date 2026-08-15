import { db } from "@/lib/db";
import { ACTIVE_ASSIGNMENT_STATUSES } from "@/features/assignments/utils";

type ScheduleRole = "MANAGER" | "EMPLOYEE";

export async function listScheduleShifts(role: ScheduleRole, employeeId?: string | null) {
  const now = new Date();

  return db.shift.findMany({
    where:
      role === "MANAGER"
        ? {
            startTime: {
              gte: now,
            },
          }
        : {
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
            assignments: {
              some: {
                employeeId: employeeId ?? "",
                status: {
                  in: ACTIVE_ASSIGNMENT_STATUSES,
                },
              },
            },
          },
    orderBy: {
      startTime: "asc",
    },
    include: {
      event: true,
      assignments: true,
    },
  });
}
