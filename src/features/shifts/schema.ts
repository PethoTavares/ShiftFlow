import { z } from "zod";

export const shiftSchema = z
  .object({
    eventId: z.string().min(1, "Event is required."),
    title: z.string().min(2, "Shift title must be at least 2 characters."),
    description: z.string().max(500, "Description must be 500 characters or fewer.").optional(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    requiredWorkers: z.coerce.number().int().positive("Required workers must be greater than zero."),
    status: z.enum(["OPEN", "FULL", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after the start time.",
    path: ["endTime"],
  });
