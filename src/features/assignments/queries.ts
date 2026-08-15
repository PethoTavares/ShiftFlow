import { db } from "@/lib/db";
import { ACTIVE_ASSIGNMENT_STATUSES } from "@/features/assignments/utils";

export async function getAssignableEmployees(shiftId: string, search?: string) {
  return db.employee.findMany({
    where: {
      status: "ACTIVE",
      assignments: {
        none: {
          shiftId,
          status: {
            in: ACTIVE_ASSIGNMENT_STATUSES,
          },
        },
      },
      user: search
        ? {
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
          }
        : undefined,
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
    include: {
      user: true,
    },
  });
}
