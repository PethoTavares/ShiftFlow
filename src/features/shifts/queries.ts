import { db } from "@/lib/db";

export async function listShifts(status?: string) {
  return db.shift.findMany({
    where:
      status && status !== "ALL"
        ? {
            status: status as "OPEN" | "FULL" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
          }
        : undefined,
    orderBy: {
      startTime: "asc",
    },
    include: {
      event: true,
      assignments: {
        include: {
          employee: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });
}

export async function getShiftById(id: string) {
  return db.shift.findUnique({
    where: { id },
    include: {
      event: true,
      assignments: {
        include: {
          employee: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });
}

export async function listShiftEvents() {
  return db.event.findMany({
    where: {
      status: {
        in: ["DRAFT", "UPCOMING", "ACTIVE"],
      },
    },
    orderBy: {
      startDate: "asc",
    },
  });
}
