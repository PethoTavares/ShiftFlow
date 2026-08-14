import type { ReactNode } from "react";
import Link from "next/link";

import { Sidebar } from "@/components/layout/sidebar";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireUser();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[18rem_1fr]">
      <div className="hidden lg:block">
        <Sidebar session={session} />
      </div>
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-[var(--color-border)] bg-white px-4 py-4 lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-lg font-semibold">
              ShiftFlow
            </Link>
            <span className="text-sm text-[var(--color-muted-foreground)]">{session.user.role}</span>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto">
            <Link href="/dashboard" className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm">
              Dashboard
            </Link>
            {session.user.role === "MANAGER" ? (
              <>
                <Link href="/events" className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm">
                  Events
                </Link>
                <Link href="/employees" className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm">
                  Employees
                </Link>
                <Link href="/shifts" className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm">
                  Shifts
                </Link>
              </>
            ) : null}
            <Link href="/schedule" className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm">
              Schedule
            </Link>
            <Link href="/settings" className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm">
              Settings
            </Link>
          </nav>
        </header>
        <div className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</div>
      </div>
    </div>
  );
}
