import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "MANAGER" | "EMPLOYEE";
      employeeId: string | null;
    };
  }

  interface User {
    role: "MANAGER" | "EMPLOYEE";
    employeeId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "MANAGER" | "EMPLOYEE";
    employeeId?: string | null;
  }
}
