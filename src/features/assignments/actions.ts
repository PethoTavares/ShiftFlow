"use server";

import { redirect } from "next/navigation";

import { requireManager } from "@/lib/auth";
import { db } from "@/lib/db";

import { assignmentSchema } from "./schema";
import { canAssignWithinCapacity, isEmployeeAssignable, rangesOverlap } from "./utils";

export async function assignEmployeeToShift(formData: FormData) {
  await requireManager();
  const shiftId = String(formData.get("shiftId") ?? "");
  const parsed = assignmentSchema.safeParse({
    shiftId,
    employeeId: formData.get("employeeId"),
    overrideCapacity: formData.get("overrideCapacity") === "on",
  });

  if (!parsed.success) {
    redirect(`/shifts/${shiftId}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid assignment data.")}`);
  }

  const shift = await db.shift.findUnique({
    where: { id: parsed.data.shiftId },
    include: {
      assignments: true,
    },
  });

  if (!shift) {
    redirect("/shifts?error=Shift not found.");
  }

  const employee = await db.employee.findUnique({
    where: { id: parsed.data.employeeId },
    include: {
      assignments: {
        where: {
          status: {
            in: ["ASSIGNED", "CONFIRMED"],
          },
        },
        include: {
          shift: true,
        },
      },
    },
  });

  if (!employee || !isEmployeeAssignable(employee.status)) {
    redirect(`/shifts/${shiftId}?error=Only active employees can be assigned.`);
  }

  const existingAssignment = await db.shiftAssignment.findUnique({
    where: {
      shiftId_employeeId: {
        shiftId: shift.id,
        employeeId: employee.id,
      },
    },
  });

  if (existingAssignment) {
    redirect(`/shifts/${shiftId}?error=That employee is already assigned to this shift.`);
  }

  if (!canAssignWithinCapacity(shift.requiredWorkers, shift.assignments.length, parsed.data.overrideCapacity)) {
    redirect(`/shifts/${shiftId}?error=This shift is already at capacity.`);
  }

  const overlappingAssignment = employee.assignments.find((assignment) =>
    rangesOverlap(
      { startTime: assignment.shift.startTime, endTime: assignment.shift.endTime },
      { startTime: shift.startTime, endTime: shift.endTime },
    ),
  );

  if (overlappingAssignment) {
    redirect(`/shifts/${shiftId}?error=This employee has an overlapping shift assignment.`);
  }

  await db.shiftAssignment.create({
    data: {
      shiftId: shift.id,
      employeeId: employee.id,
      status: "ASSIGNED",
    },
  });

  const assignedWorkers = shift.assignments.length + 1;
  const nextStatus = assignedWorkers >= shift.requiredWorkers ? "FULL" : shift.status;

  await db.shift.update({
    where: { id: shift.id },
    data: { status: nextStatus },
  });

  redirect(`/shifts/${shiftId}?success=Employee assigned successfully.`);
}

export async function removeEmployeeFromShift(formData: FormData) {
  await requireManager();
  const shiftId = String(formData.get("shiftId") ?? "");
  const assignmentId = String(formData.get("assignmentId") ?? "");

  await db.shiftAssignment.update({
    where: { id: assignmentId },
    data: {
      status: "CANCELLED",
    },
  });

  redirect(`/shifts/${shiftId}?success=Employee removed from shift.`);
}
