import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().min(2, "Employee name must be at least 2 characters."),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must include an uppercase letter.")
    .regex(/[a-z]/, "Password must include a lowercase letter.")
    .regex(/[0-9]/, "Password must include a number."),
  phone: z.string().min(7, "Phone number must be at least 7 digits."),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export const employeeUpdateSchema = employeeSchema.partial({ password: true }).extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must include an uppercase letter.")
    .regex(/[a-z]/, "Password must include a lowercase letter.")
    .regex(/[0-9]/, "Password must include a number.")
    .optional()
    .or(z.literal("")),
});
