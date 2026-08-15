"use server";

import { redirect } from "next/navigation";

import { Prisma } from "@/lib/generated/prisma/client";
import { requireManager } from "@/lib/auth";
import { db } from "@/lib/db";

import { assignmentSchema } from "./schema";
import {
  ACTIVE_ASSIGNMENT_STATUSES,
  canAssignWithinCapacity,
  getShiftStaffingStatus,
  isEmployeeAssignable,
  isEventOpenForAssignments,
  isShiftOpenForAssignments,
  rangesOverlap,
} from "./utils";

function redirectShiftError(shiftId: string, message: string): never {
  redirect(`/shifts/${shiftId}?error=${encodeURIComponent(message)}`);
}

async function syncShiftStaffingStatus(tx: Prisma.TransactionClient, shiftId: string) {
  const shift = await tx.shift.findUnique({
    where: { id: shiftId },
    include: {
      assignments: {
        where: {
          status: {
            in: ACTIVE_ASSIGNMENT_STATUSES,
          },
        },
      },
    },
  });

  if (!shift) {
    return null;
  }

  const nextStatus = getShiftStaffingStatus(
    shift.requiredWorkers,
    shift.assignments.length,
    shift.status,
  );

  if (nextStatus !== shift.status) {
    await tx.shift.update({
      where: { id: shift.id },
      data: { status: nextStatus },
    });
  }

  return {
    shift,
    activeAssignmentCount: shift.assignments.length,
    nextStatus,
  };
}

export async function assignEmployeeToShiftById(shiftId: string, employeeId: string) {
  try {
    await db.$transaction(async (tx) => {
      const shift = await tx.shift.findUnique({
        where: { id: shiftId },
        include: {
          event: true,
          assignments: {
            where: {
              status: {
                in: ACTIVE_ASSIGNMENT_STATUSES,
              },
            },
          },
        },
      });

      if (!shift) {
        redirect("/shifts?error=Shift not found.");
      }

      if (!isShiftOpenForAssignments(shift.status)) {
        redirectShiftError(shiftId, "Employees cannot be assigned to cancelled or completed shifts.");
      }

      if (!isEventOpenForAssignments(shift.event.status)) {
        redirectShiftError(shiftId, "Employees cannot be assigned to shifts for cancelled or completed events.");
      }

      const employee = await tx.employee.findUnique({
        where: { id: employeeId },
        include: {
          assignments: {
            where: {
              status: {
                in: ACTIVE_ASSIGNMENT_STATUSES,
              },
            },
            include: {
              shift: true,
            },
          },
        },
      });

      if (!employee || !isEmployeeAssignable(employee.status)) {
        redirectShiftError(shiftId, "Only active employees can be assigned.");
      }

      const existingAssignment = await tx.shiftAssignment.findUnique({
        where: {
          shiftId_employeeId: {
            shiftId: shift.id,
            employeeId: employee.id,
          },
        },
      });

      if (existingAssignment) {
        redirectShiftError(shiftId, "That employee is already assigned to this shift.");
      }

      if (!canAssignWithinCapacity(shift.requiredWorkers, shift.assignments.length)) {
        redirectShiftError(shiftId, "This shift is already at capacity.");
      }

      const overlappingAssignment = employee.assignments.find((assignment) =>
        rangesOverlap(
          { startTime: assignment.shift.startTime, endTime: assignment.shift.endTime },
          { startTime: shift.startTime, endTime: shift.endTime },
        ),
      );

      if (overlappingAssignment) {
        redirectShiftError(shiftId, "This employee has an overlapping shift assignment.");
      }

      await tx.shiftAssignment.create({
        data: {
          shiftId: shift.id,
          employeeId: employee.id,
          status: "ASSIGNED",
        },
      });

      await syncShiftStaffingStatus(tx, shift.id);
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirectShiftError(shiftId, "That employee is already assigned to this shift.");
    }

    throw error;
  }
}

export async function assignEmployeeToShift(formData: FormData) {
  await requireManager();
  const shiftId = String(formData.get("shiftId") ?? "");
  const parsed = assignmentSchema.safeParse({
    shiftId,
    employeeId: formData.get("employeeId"),
  });

  if (!parsed.success) {
    redirectShiftError(shiftId, parsed.error.issues[0]?.message ?? "Invalid assignment data.");
  }

  await assignEmployeeToShiftById(parsed.data.shiftId, parsed.data.employeeId);

  redirect(`/shifts/${shiftId}?success=Employee assigned successfully.`);
}

export async function removeEmployeeFromShiftById(assignmentId: string) {
  return db.$transaction(async (tx) => {
    const assignment = await tx.shiftAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        shift: true,
      },
    });

    if (!assignment) {
      redirect("/shifts?error=Assignment not found.");
    }

    if (assignment.status !== "CANCELLED") {
      await tx.shiftAssignment.update({
        where: { id: assignment.id },
        data: {
          status: "CANCELLED",
        },
      });
    }

    await syncShiftStaffingStatus(tx, assignment.shiftId);

    return assignment.shiftId;
  });
}

export async function removeEmployeeFromShift(formData: FormData) {
  await requireManager();
  const assignmentId = String(formData.get("assignmentId") ?? "");
  const result = await removeEmployeeFromShiftById(assignmentId);

  redirect(`/shifts/${result}?success=Employee removed from shift.`);
}
