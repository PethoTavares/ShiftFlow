type TimeRange = {
  startTime: Date;
  endTime: Date;
};

export function rangesOverlap(a: TimeRange, b: TimeRange) {
  return a.startTime < b.endTime && b.startTime < a.endTime;
}

export function canAssignWithinCapacity(requiredWorkers: number, assignedWorkers: number, overrideCapacity = false) {
  if (overrideCapacity) {
    return true;
  }

  return assignedWorkers < requiredWorkers;
}

export function isEmployeeAssignable(status: "ACTIVE" | "INACTIVE") {
  return status === "ACTIVE";
}

export function assertManagerRole(role: "MANAGER" | "EMPLOYEE") {
  return role === "MANAGER";
}
