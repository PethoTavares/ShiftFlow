import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/auth";
import { getSettingsProfile } from "@/features/settings/queries";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireUser();
  const employee = await getSettingsProfile(session.user.employeeId, session.user.role);

  return (
    <div className="app-shell">
      <PageHeader
        title="Settings"
        description="Review your account details and jump to the profile surface that already exists in the product."
      />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="app-panel-section">
          <h2 className="app-section-heading">Account</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <p className="app-kicker">Name</p>
              <p className="mt-2 font-medium">{session.user.name}</p>
            </div>
            <div>
              <p className="app-kicker">Email</p>
              <p className="mt-2 font-medium">{session.user.email}</p>
            </div>
            <div>
              <p className="app-kicker">Role</p>
              <div className="mt-2">
                <StatusBadge status={session.user.role} />
              </div>
            </div>
            {employee ? (
              <div>
                <p className="app-kicker">Phone</p>
                <p className="mt-2 font-medium">{employee.phone || "Not provided"}</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="app-panel-section">
          <h2 className="app-section-heading">Available actions</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">
            ShiftFlow keeps this page focused on real account information instead of placeholder settings.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            {session.user.role === "MANAGER" ? (
              <>
                <Link href="/employees" className={buttonVariants({ variant: "secondary" })}>
                  Manage employees
                </Link>
                <Link href="/dashboard" className={buttonVariants({ variant: "ghost" })}>
                  Return to dashboard
                </Link>
              </>
            ) : session.user.employeeId ? (
              <>
                <Link href={`/employees/${session.user.employeeId}`} className={buttonVariants({ variant: "secondary" })}>
                  View profile
                </Link>
                <Link href="/schedule" className={buttonVariants({ variant: "ghost" })}>
                  Open schedule
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
