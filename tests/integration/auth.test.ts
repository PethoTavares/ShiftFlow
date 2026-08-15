import type { Session } from "next-auth";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { authOptions, authenticateUserByCredentials } from "../../src/lib/auth";
import { createEmployeeRecord, createUser, disconnectTestDb, resetDatabase } from "./helpers/test-db";

describe("authentication", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });
  it("authenticates valid manager credentials and returns session data", async () => {
    const manager = await createUser({
      name: "Manager",
      email: "manager-auth@test.dev",
      password: "DevelopmentPassword123!",
    });

    const user = await authenticateUserByCredentials({
      email: "manager-auth@test.dev",
      password: "DevelopmentPassword123!",
    });

    expect(user).not.toBeNull();
    expect(user?.id).toBe(manager.id);
    expect(user?.role).toBe("MANAGER");
    expect(user?.employeeId).toBeNull();
  });

  it("rejects invalid passwords and inactive employees", async () => {
    await createUser({
      name: "Manager",
      email: "manager-invalid@test.dev",
      password: "DevelopmentPassword123!",
    });
    await createEmployeeRecord({
      name: "Inactive Employee",
      email: "employee-auth@test.dev",
      password: "DevelopmentPassword123!",
      status: "INACTIVE",
    });

    const invalidPassword = await authenticateUserByCredentials({
      email: "manager-invalid@test.dev",
      password: "WrongPassword123!",
    });
    const inactiveEmployee = await authenticateUserByCredentials({
      email: "employee-auth@test.dev",
      password: "DevelopmentPassword123!",
    });

    expect(invalidPassword).toBeNull();
    expect(inactiveEmployee).toBeNull();
  });

  it("stores user id, role, and employeeId in JWT/session callbacks", async () => {
    const employeeUser = await createEmployeeRecord({
      name: "Employee Callback",
      email: "employee-callback@test.dev",
      password: "DevelopmentPassword123!",
    });

    const authenticated = await authenticateUserByCredentials({
      email: "employee-callback@test.dev",
      password: "DevelopmentPassword123!",
    });

    expect(authenticated).not.toBeNull();
    expect(authOptions.callbacks?.jwt).toBeDefined();
    expect(authOptions.callbacks?.session).toBeDefined();

    const jwtCallback = authOptions.callbacks!.jwt!;
    const sessionCallback = authOptions.callbacks!.session!;

    const token = await jwtCallback({
      token: { sub: employeeUser.id },
      user: authenticated!,
      account: null,
      profile: undefined,
      trigger: "signIn",
      isNewUser: false,
      session: undefined,
    });

    const session = (await sessionCallback({
      session: {
        user: {
          id: "",
          role: "EMPLOYEE",
          employeeId: null,
          name: authenticated!.name,
          email: authenticated!.email,
          image: null,
        },
        expires: new Date(Date.now() + 60_000).toISOString(),
      },
      token: token!,
      user: {
        id: employeeUser.id,
        role: "EMPLOYEE",
        employeeId: employeeUser.employee?.id ?? null,
        email: authenticated!.email,
        emailVerified: null,
        name: authenticated!.name,
        image: null,
      },
      newSession: undefined,
      trigger: "update",
    })) as Session;

    expect(session.user.id).toBe(employeeUser.id);
    expect(session.user.role).toBe("EMPLOYEE");
    expect(session.user.employeeId).toBe(employeeUser.employee?.id ?? null);
  });
});
