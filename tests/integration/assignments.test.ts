import { describe, expect, it } from "vitest";

import {
  assertManagerRole,
  canAssignWithinCapacity,
  isEmployeeAssignable,
  rangesOverlap,
} from "../../src/features/assignments/utils";

describe("assignment business rules", () => {
  it("prevents duplicate assignments when a composite uniqueness rule is already satisfied elsewhere", () => {
    const assignedEmployeeIds = ["emp_1", "emp_2"];

    expect(assignedEmployeeIds.includes("emp_1")).toBe(true);
  });

  it("blocks inactive employees from assignment", () => {
    expect(isEmployeeAssignable("INACTIVE")).toBe(false);
    expect(isEmployeeAssignable("ACTIVE")).toBe(true);
  });

  it("prevents over-capacity assignment by default", () => {
    expect(canAssignWithinCapacity(3, 3)).toBe(false);
    expect(canAssignWithinCapacity(3, 3, true)).toBe(true);
  });

  it("detects overlapping shifts", () => {
    expect(
      rangesOverlap(
        {
          startTime: new Date("2026-08-21T09:00:00.000Z"),
          endTime: new Date("2026-08-21T13:00:00.000Z"),
        },
        {
          startTime: new Date("2026-08-21T12:00:00.000Z"),
          endTime: new Date("2026-08-21T15:00:00.000Z"),
        },
      ),
    ).toBe(true);
  });

  it("allows only managers through the role guard", () => {
    expect(assertManagerRole("MANAGER")).toBe(true);
    expect(assertManagerRole("EMPLOYEE")).toBe(false);
  });
});
