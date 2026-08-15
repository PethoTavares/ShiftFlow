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

vi.mock("@/features/employees/queries", () => ({
  getEmployeeById: vi.fn(async (id: string) => ({
    id,
    status: "ACTIVE",
    phone: "206-555-0101",
    user: {
      name: "Employee B",
      email: "employee-b@test.dev",
    },
    assignments: [],
  })),
}));

describe("authorization boundaries", () => {
  beforeEach(() => {
    mockGetServerSession.mockReset();
    mockGetServerSession.mockResolvedValue({
      user: {
        id: "employee-user",
        name: "Employee A",
        email: "employee-a@test.dev",
        role: "EMPLOYEE",
        employeeId: "employee-a",
      },
    });
  });

  it("prevents employees from executing manager-only mutations", async () => {
    const [
      employeesActions,
      eventsActions,
      shiftsActions,
      assignmentsActions,
    ] = await Promise.all([
      import("@/features/employees/actions"),
      import("@/features/events/actions"),
      import("@/features/shifts/actions"),
      import("@/features/assignments/actions"),
    ]);

    const formData = new FormData();

    const mutations = [
      () => employeesActions.createEmployee(formData),
      () => employeesActions.updateEmployee(formData),
      () => employeesActions.deactivateEmployee(formData),
      () => eventsActions.createEvent(formData),
      () => eventsActions.updateEvent(formData),
      () => shiftsActions.createShift(formData),
      () => shiftsActions.updateShift(formData),
      () => assignmentsActions.assignEmployeeToShift(formData),
      () => assignmentsActions.removeEmployeeFromShift(formData),
    ];

    for (const mutation of mutations) {
      await expect(mutation()).rejects.toMatchObject({
        url: expect.stringContaining("/dashboard?error=You are not authorized"),
      });
    }
  });

  it("prevents an employee from loading another employee's private page", async () => {
    const pageModule = await import("@/app/(dashboard)/employees/[id]/page");

    await expect(
      pageModule.default({
        params: Promise.resolve({ id: "employee-b" }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toMatchObject({
      url: expect.stringContaining("/dashboard?error=You can only access your own profile."),
    });
  });
});
