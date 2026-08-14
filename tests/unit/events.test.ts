import { describe, expect, it } from "vitest";

import { eventSchema } from "../../src/features/events/schema";

describe("eventSchema", () => {
  it("accepts a valid event payload", () => {
    const result = eventSchema.safeParse({
      name: "Operations Summit",
      description: "Manager planning event",
      location: "Seattle",
      startDate: "2026-08-20T08:00:00.000Z",
      endDate: "2026-08-20T18:00:00.000Z",
      status: "UPCOMING",
    });

    expect(result.success).toBe(true);
  });

  it("rejects events whose end date is before the start date", () => {
    const result = eventSchema.safeParse({
      name: "Broken event",
      location: "Seattle",
      startDate: "2026-08-20T18:00:00.000Z",
      endDate: "2026-08-20T08:00:00.000Z",
      status: "UPCOMING",
    });

    expect(result.success).toBe(false);
  });
});
