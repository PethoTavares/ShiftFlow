import { db } from "@/lib/db";

export async function listEvents(status?: string) {
  return db.event.findMany({
    where:
      status && status !== "ALL"
        ? {
            status: status as "DRAFT" | "UPCOMING" | "ACTIVE" | "COMPLETED" | "CANCELLED",
          }
        : undefined,
    orderBy: {
      startDate: "asc",
    },
    include: {
      shifts: {
        include: {
          assignments: true,
        },
      },
    },
  });
}

export async function getEventById(id: string) {
  return db.event.findUnique({
    where: { id },
    include: {
      shifts: {
        orderBy: {
          startTime: "asc",
        },
        include: {
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
      },
    },
  });
}
