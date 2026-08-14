import { db } from "@/lib/db";

export async function getAssignableEmployees(search?: string) {
  return db.employee.findMany({
    where: {
      status: "ACTIVE",
      user: search
        ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
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
