import { db } from "@/lib/db";
import { ACTIVE_ASSIGNMENT_STATUSES } from "@/features/assignments/utils";

export async function listEmployees(status?: string, search?: string) {
  return db.employee.findMany({
    where: {
      ...(status && status !== "ALL"
        ? {
            status: status as "ACTIVE" | "INACTIVE",
          }
        : {}),
      ...(search
        ? {
            user: {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            },
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      assignments: {
        where: {
          status: {
            in: ACTIVE_ASSIGNMENT_STATUSES,
          },
          shift: {
            startTime: {
              gte: new Date(),
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
      },
    },
  });
}

export async function getEmployeeById(id: string) {
  return db.employee.findUnique({
    where: { id },
    include: {
      user: true,
      assignments: {
        orderBy: {
          shift: {
            startTime: "asc",
          },
        },
        include: {
          shift: {
            include: {
              event: true,
            },
          },
        },
      },
    },
  });
}
