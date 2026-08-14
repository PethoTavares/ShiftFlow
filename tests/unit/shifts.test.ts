import { describe, expect, it } from "vitest";

import { shiftSchema } from "../../src/features/shifts/schema";

describe("shiftSchema", () => {
  it("requires a positive worker count", () => {
    const result = shiftSchema.safeParse({
      eventId: "event_123",
      title: "Registration desk",
      startTime: "2026-08-21T08:00:00.000Z",
      endTime: "2026-08-21T12:00:00.000Z",
      requiredWorkers: 0,
      status: "OPEN",
    });

    expect(result.success).toBe(false);
  });

  it("rejects shifts whose end time is before the start time", () => {
    const result = shiftSchema.safeParse({
      eventId: "event_123",
      title: "Registration desk",
      startTime: "2026-08-21T12:00:00.000Z",
      endTime: "2026-08-21T08:00:00.000Z",
      requiredWorkers: 2,
      status: "OPEN",
    });

    expect(result.success).toBe(false);
  });
});
