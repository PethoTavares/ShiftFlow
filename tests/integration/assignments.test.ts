import { beforeEach, describe, expect, it, vi } from "vitest";

class RedirectError extends Error {
  constructor(public url: string) {
    super(`Redirected to ${url}`);
  }
}

const { mockGetServerSession } = vi.hoisted(() => ({
  mockGetServerSession: vi.fn(),
}));

vi.mock("next-auth", async () => {
  const actual = await vi.importActual<typeof import("next-auth")>("next-auth");

  return {
    ...actual,
    getServerSession: mockGetServerSession,
  };
});

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");

  return {
    ...actual,
    redirect: (url: string) => {
      throw new RedirectError(url);
    },
  };
});

import {
  assignEmployeeToShiftById,
  removeEmployeeFromShiftById,
} from "../../src/features/assignments/actions";
import { calculateOpenPositions } from "../../src/features/dashboard/queries";
import { deactivateEmployee } from "../../src/features/employees/actions";
import {
  createEmployeeRecord,
  createEventRecord,
  createShiftRecord,
  createUser,
  resetDatabase,
  testDb,
} from "./helpers/test-db";

describe("assignment workflows", () => {
  beforeEach(async () => {
    await resetDatabase();
    mockGetServerSession.mockReset();
    mockGetServerSession.mockResolvedValue({
      user: {
        id: "manager-session",
        role: "MANAGER",
        employeeId: null,
      },
    });
  });
  it("creates an assignment and rejects duplicate assignment", async () => {
    const manager = await createUser({ name: "Manager", email: "manager@test.dev" });
    const employeeUser = await createEmployeeRecord({ name: "Employee One", email: "employee1@test.dev" });
    const event = await createEventRecord({ createdById: manager.id });
    const shift = await createShiftRecord({ eventId: event.id, requiredWorkers: 2 });

    await assignEmployeeToShiftById(shift.id, employeeUser.employee!.id);

    const assignments = await testDb.shiftAssignment.findMany({
      where: { shiftId: shift.id },
    });

    expect(assignments).toHaveLength(1);
    expect(assignments[0]?.employeeId).toBe(employeeUser.employee!.id);

    await expect(assignEmployeeToShiftById(shift.id, employeeUser.employee!.id)).rejects.toMatchObject({
      url: expect.stringContaining("already%20assigned%20to%20this%20shift"),
    });
  });

  it("enforces capacity and reopens a shift when an assignment is removed", async () => {
    const manager = await createUser({ name: "Manager", email: "manager2@test.dev" });
    const firstEmployee = await createEmployeeRecord({ name: "Employee One", email: "employee2@test.dev" });
    const secondEmployee = await createEmployeeRecord({ name: "Employee Two", email: "employee3@test.dev" });
    const event = await createEventRecord({ createdById: manager.id });
    const shift = await createShiftRecord({ eventId: event.id, requiredWorkers: 1 });

    await assignEmployeeToShiftById(shift.id, firstEmployee.employee!.id);

    await expect(assignEmployeeToShiftById(shift.id, secondEmployee.employee!.id)).rejects.toMatchObject({
      url: expect.stringContaining("already%20at%20capacity"),
    });

    const fullShift = await testDb.shift.findUniqueOrThrow({ where: { id: shift.id } });
    expect(fullShift.status).toBe("FULL");

    const assignment = await testDb.shiftAssignment.findFirstOrThrow({
      where: { shiftId: shift.id, employeeId: firstEmployee.employee!.id },
    });

    const returnedShiftId = await removeEmployeeFromShiftById(assignment.id);
    expect(returnedShiftId).toBe(shift.id);

    const reopenedShift = await testDb.shift.findUniqueOrThrow({ where: { id: shift.id } });
    expect(reopenedShift.status).toBe("OPEN");
  });

  it("rejects overlapping assignments but allows back-to-back shifts", async () => {
    const manager = await createUser({ name: "Manager", email: "manager3@test.dev" });
    const employeeUser = await createEmployeeRecord({ name: "Employee One", email: "employee4@test.dev" });
    const event = await createEventRecord({ createdById: manager.id });
    const firstShift = await createShiftRecord({
      eventId: event.id,
      title: "Morning",
      startTime: new Date("2026-08-20T09:00:00.000Z"),
      endTime: new Date("2026-08-20T13:00:00.000Z"),
    });
    const overlappingShift = await createShiftRecord({
      eventId: event.id,
      title: "Overlap",
      startTime: new Date("2026-08-20T12:00:00.000Z"),
      endTime: new Date("2026-08-20T16:00:00.000Z"),
    });
    const adjacentShift = await createShiftRecord({
      eventId: event.id,
      title: "Adjacent",
      startTime: new Date("2026-08-20T13:00:00.000Z"),
      endTime: new Date("2026-08-20T17:00:00.000Z"),
    });

    await assignEmployeeToShiftById(firstShift.id, employeeUser.employee!.id);

    await expect(assignEmployeeToShiftById(overlappingShift.id, employeeUser.employee!.id)).rejects.toMatchObject({
      url: expect.stringContaining("overlapping%20shift%20assignment"),
    });

    await expect(assignEmployeeToShiftById(adjacentShift.id, employeeUser.employee!.id)).resolves.toBeUndefined();
  });

  it("rejects inactive employees and cancelled/completed lifecycle states", async () => {
    const manager = await createUser({ name: "Manager", email: "manager4@test.dev" });
    const inactiveEmployee = await createEmployeeRecord({
      name: "Inactive Employee",
      email: "employee5@test.dev",
      status: "INACTIVE",
    });
    const activeEmployee = await createEmployeeRecord({
      name: "Active Employee",
      email: "employee6@test.dev",
    });
    const cancelledEvent = await createEventRecord({
      createdById: manager.id,
      status: "CANCELLED",
      name: "Cancelled Event",
    });
    const liveEvent = await createEventRecord({
      createdById: manager.id,
      status: "UPCOMING",
      name: "Live Event",
    });
    const cancelledShift = await createShiftRecord({
      eventId: liveEvent.id,
      title: "Cancelled Shift",
      status: "CANCELLED",
    });
    const completedShift = await createShiftRecord({
      eventId: liveEvent.id,
      title: "Completed Shift",
      status: "COMPLETED",
    });
    const shiftOnCancelledEvent = await createShiftRecord({
      eventId: cancelledEvent.id,
      title: "Shift On Cancelled Event",
    });
    const activeShift = await createShiftRecord({
      eventId: liveEvent.id,
      title: "Active Shift",
    });

    await expect(assignEmployeeToShiftById(activeShift.id, inactiveEmployee.employee!.id)).rejects.toMatchObject({
      url: expect.stringContaining("Only%20active%20employees%20can%20be%20assigned"),
    });
    await expect(assignEmployeeToShiftById(cancelledShift.id, activeEmployee.employee!.id)).rejects.toMatchObject({
      url: expect.stringContaining("cancelled%20or%20completed%20shifts"),
    });
    await expect(assignEmployeeToShiftById(completedShift.id, activeEmployee.employee!.id)).rejects.toMatchObject({
      url: expect.stringContaining("cancelled%20or%20completed%20shifts"),
    });
    await expect(assignEmployeeToShiftById(shiftOnCancelledEvent.id, activeEmployee.employee!.id)).rejects.toMatchObject({
      url: expect.stringContaining("cancelled%20or%20completed%20events"),
    });
  });

  it("blocks employee deactivation while future active assignments exist", async () => {
    const manager = await createUser({ name: "Manager", email: "manager5@test.dev" });
    const employeeUser = await createEmployeeRecord({ name: "Employee One", email: "employee7@test.dev" });
    const event = await createEventRecord({
      createdById: manager.id,
      startDate: new Date("2026-08-25T08:00:00.000Z"),
      endDate: new Date("2026-08-25T18:00:00.000Z"),
    });
    const shift = await createShiftRecord({
      eventId: event.id,
      startTime: new Date("2026-08-25T09:00:00.000Z"),
      endTime: new Date("2026-08-25T13:00:00.000Z"),
    });

    await assignEmployeeToShiftById(shift.id, employeeUser.employee!.id);

    const formData = new FormData();
    formData.set("employeeId", employeeUser.employee!.id);

    await expect(deactivateEmployee(formData)).rejects.toMatchObject({
      url: expect.stringContaining("Cannot%20deactivate%20this%20employee%20because%20they%20have%201%20upcoming%20shift%20assignments"),
    });
  });

  it("calculates dashboard open positions from remaining capacity", () => {
    const openPositions = calculateOpenPositions([
      {
        requiredWorkers: 5,
        assignments: [{ status: "ASSIGNED" }, { status: "CONFIRMED" }, { status: "CANCELLED" }],
      },
      {
        requiredWorkers: 2,
        assignments: [{ status: "ASSIGNED" }, { status: "ASSIGNED" }],
      },
    ]);

    expect(openPositions).toBe(3);
  });
});
