"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";

import { Prisma } from "@/lib/generated/prisma/client";
import { requireManager } from "@/lib/auth";
import { db } from "@/lib/db";
import { ACTIVE_ASSIGNMENT_STATUSES } from "@/features/assignments/utils";

import { employeeSchema, employeeUpdateSchema } from "./schema";

function isUniqueEmailError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function countUpcomingActiveAssignmentsForEmployee(employeeId: string) {
  return db.shiftAssignment.count({
    where: {
      employeeId,
      status: {
        in: ACTIVE_ASSIGNMENT_STATUSES,
      },
      shift: {
        startTime: {
          gt: new Date(),
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
  });
}

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

  try {
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
  } catch (error) {
    if (isUniqueEmailError(error)) {
      redirect("/employees/new?error=An account with this email already exists.");
    }

    throw error;
  }

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

  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser && existingUser.id !== employee.userId) {
    redirect(`/employees/${employeeId}/edit?error=An account with this email already exists.`);
  }

  const passwordHash =
    data.password && data.password.length > 0
      ? await hash(data.password, 12)
      : employee.user.passwordHash;

  try {
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
  } catch (error) {
    if (isUniqueEmailError(error)) {
      redirect(`/employees/${employeeId}/edit?error=An account with this email already exists.`);
    }

    throw error;
  }

  redirect(`/employees/${employeeId}?success=Employee updated successfully.`);
}

export async function deactivateEmployee(formData: FormData) {
  await requireManager();
  const employeeId = String(formData.get("employeeId") ?? "");

  const upcomingAssignments = await countUpcomingActiveAssignmentsForEmployee(employeeId);

  if (upcomingAssignments > 0) {
    redirect(
      `/employees/${employeeId}?error=${encodeURIComponent(
        `Cannot deactivate this employee because they have ${upcomingAssignments} upcoming shift assignments. Remove or reassign those shifts first.`,
      )}`,
    );
  }

  await db.employee.update({
    where: { id: employeeId },
    data: {
      status: "INACTIVE",
    },
  });

  redirect(`/employees/${employeeId}?success=Employee deactivated.`);
}
