import { z } from "zod";

export const eventSchema = z
  .object({
    name: z.string().min(2, "Event name must be at least 2 characters."),
    description: z.string().max(500, "Description must be 500 characters or fewer.").optional(),
    location: z.string().min(2, "Location is required."),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    status: z.enum(["DRAFT", "UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"]),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after the start date.",
    path: ["endDate"],
  });
