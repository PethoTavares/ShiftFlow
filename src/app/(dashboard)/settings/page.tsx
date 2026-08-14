import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireUser();
  const employee =
    session.user.employeeId && session.user.role === "EMPLOYEE"
      ? await db.employee.findUnique({
          where: { id: session.user.employeeId },
        })
      : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Review your account information and jump to profile editing surfaces."
      />
      <section className="max-w-3xl rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-[var(--color-muted-foreground)]">Name</p>
            <p className="mt-1 font-medium">{session.user.name}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--color-muted-foreground)]">Email</p>
            <p className="mt-1 font-medium">{session.user.email}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--color-muted-foreground)]">Role</p>
            <p className="mt-1 font-medium">{session.user.role}</p>
          </div>
          {employee ? (
            <div>
              <p className="text-sm text-[var(--color-muted-foreground)]">Phone</p>
              <p className="mt-1 font-medium">{employee.phone}</p>
            </div>
          ) : null}
          {session.user.role === "MANAGER" ? (
            <Link href="/employees" className="inline-flex rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium">
              Manage employees
            </Link>
          ) : session.user.employeeId ? (
            <Link href={`/employees/${session.user.employeeId}`} className="inline-flex rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium">
              View profile
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
