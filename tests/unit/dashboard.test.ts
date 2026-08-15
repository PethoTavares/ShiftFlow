import { describe, expect, it } from "vitest";

import { calculateOpenPositions } from "../../src/features/dashboard/queries";

describe("dashboard metrics", () => {
  it("counts only remaining positions from active assignments", () => {
    const result = calculateOpenPositions([
      {
        requiredWorkers: 4,
        assignments: [{ status: "ASSIGNED" }, { status: "CONFIRMED" }, { status: "CANCELLED" }],
      },
      {
        requiredWorkers: 2,
        assignments: [{ status: "ASSIGNED" }, { status: "ASSIGNED" }],
      },
    ]);

    expect(result).toBe(2);
  });
});
