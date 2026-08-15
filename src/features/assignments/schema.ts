import { z } from "zod";

export const assignmentSchema = z.object({
  shiftId: z.string().min(1),
  employeeId: z.string().min(1, "Employee selection is required."),
});
