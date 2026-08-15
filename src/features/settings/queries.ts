import { db } from "@/lib/db";

export async function getSettingsProfile(employeeId: string | null, role: "MANAGER" | "EMPLOYEE") {
  if (!employeeId || role !== "EMPLOYEE") {
    return null;
  }

  return db.employee.findUnique({
    where: { id: employeeId },
  });
}
