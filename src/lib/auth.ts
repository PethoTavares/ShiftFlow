import { compare } from "bcryptjs";
import type { NextAuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { signInSchema } from "@/features/auth/schema";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: parsed.data.email,
          },
          include: {
            employee: true,
          },
        });

        if (!user) {
          return null;
        }

        if (user.role === "EMPLOYEE" && user.employee?.status !== "ACTIVE") {
          return null;
        }

        const passwordMatches = await compare(parsed.data.password, user.passwordHash);

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          employeeId: user.employee?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.employeeId = user.employeeId;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as "MANAGER" | "EMPLOYEE";
        session.user.employeeId = (token.employeeId as string | null | undefined) ?? null;
      }

      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return session;
}

export async function requireManager() {
  const session = await requireUser();

  if (session.user.role !== "MANAGER") {
    redirect("/dashboard?error=You are not authorized to access that page.");
  }

  return session;
}

export async function requireEmployeeSelf(employeeId: string) {
  const session = await requireUser();

  if (session.user.role === "MANAGER") {
    return session;
  }

  if (session.user.employeeId !== employeeId) {
    redirect("/dashboard?error=You can only access your own profile.");
  }

  return session;
}

export function getSessionUser(session: Session) {
  return session.user;
}
