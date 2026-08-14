import { db } from "@/lib/db";

export async function listEmployees(status?: string) {
  return db.employee.findMany({
    where:
      status && status !== "ALL"
        ? {
            status: status as "ACTIVE" | "INACTIVE",
          }
        : undefined,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      assignments: {
        where: {
          shift: {
            startTime: {
              gte: new Date(),
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
