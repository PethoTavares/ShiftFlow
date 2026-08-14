"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";

import { requireManager } from "@/lib/auth";
import { db } from "@/lib/db";

import { employeeSchema, employeeUpdateSchema } from "./schema";

function getEmployeeFormValues(formData: FormData) {
  return {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone"),
    status: formData.get("status"),
  };
}

export async function createEmployee(formData: FormData) {
  await requireManager();
  const parsed = employeeSchema.safeParse(getEmployeeFormValues(formData));

  if (!parsed.success) {
    redirect(`/employees/new?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid employee data.")}`);
  }

  const data = parsed.data;

  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    redirect("/employees/new?error=An account already exists for that email.");
  }

  const passwordHash = await hash(data.password, 12);

  await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: "EMPLOYEE",
      employee: {
        create: {
          phone: data.phone,
          status: data.status,
        },
      },
    },
  });

  redirect("/employees?success=Employee created successfully.");
}

export async function updateEmployee(formData: FormData) {
  await requireManager();
  const employeeId = String(formData.get("employeeId") ?? "");
  const parsed = employeeUpdateSchema.safeParse(getEmployeeFormValues(formData));

  if (!parsed.success) {
    redirect(`/employees/${employeeId}/edit?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid employee data.")}`);
  }

  const data = parsed.data;

  const employee = await db.employee.findUnique({
    where: { id: employeeId },
    include: { user: true },
  });

  if (!employee) {
    redirect("/employees?error=Employee not found.");
  }

  const passwordHash =
    data.password && data.password.length > 0
      ? await hash(data.password, 12)
      : employee.user.passwordHash;

  await db.user.update({
    where: { id: employee.userId },
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      employee: {
        update: {
          phone: data.phone,
          status: data.status,
        },
      },
    },
  });

  redirect(`/employees/${employeeId}?success=Employee updated successfully.`);
}

export async function deactivateEmployee(formData: FormData) {
  await requireManager();
  const employeeId = String(formData.get("employeeId") ?? "");

  await db.employee.update({
    where: { id: employeeId },
    data: {
      status: "INACTIVE",
    },
  });

  redirect(`/employees/${employeeId}?success=Employee deactivated.`);
}
