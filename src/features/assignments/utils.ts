import type { EventStatus, ShiftAssignmentStatus, ShiftStatus } from "@/lib/generated/prisma/client";

type TimeRange = {
  startTime: Date;
  endTime: Date;
};

export const ACTIVE_ASSIGNMENT_STATUSES: ShiftAssignmentStatus[] = ["ASSIGNED", "CONFIRMED"];

const NON_ASSIGNABLE_SHIFT_STATUSES: ShiftStatus[] = ["CANCELLED", "COMPLETED"];
const NON_ASSIGNABLE_EVENT_STATUSES: EventStatus[] = ["CANCELLED", "COMPLETED"];

export function rangesOverlap(a: TimeRange, b: TimeRange) {
  return a.startTime < b.endTime && b.startTime < a.endTime;
}

export function canAssignWithinCapacity(requiredWorkers: number, assignedWorkers: number) {
  return assignedWorkers < requiredWorkers;
}

export function isEmployeeAssignable(status: "ACTIVE" | "INACTIVE") {
  return status === "ACTIVE";
}

export function isAssignmentActive(status: ShiftAssignmentStatus) {
  return ACTIVE_ASSIGNMENT_STATUSES.includes(status);
}

export function isShiftOpenForAssignments(status: ShiftStatus) {
  return !NON_ASSIGNABLE_SHIFT_STATUSES.includes(status);
}

export function isEventOpenForAssignments(status: EventStatus) {
  return !NON_ASSIGNABLE_EVENT_STATUSES.includes(status);
}

export function getShiftStaffingStatus(
  requiredWorkers: number,
  activeAssignmentCount: number,
  currentStatus: ShiftStatus,
) {
  if (currentStatus === "CANCELLED" || currentStatus === "COMPLETED" || currentStatus === "IN_PROGRESS") {
    return currentStatus;
  }

  return activeAssignmentCount >= requiredWorkers ? "FULL" : "OPEN";
}

export function assertManagerRole(role: "MANAGER" | "EMPLOYEE") {
  return role === "MANAGER";
}
