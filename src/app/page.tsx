import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-5xl rounded-3xl border border-[var(--color-border)] bg-white p-8 shadow-sm lg:p-12">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1 text-sm font-medium text-[var(--color-muted-foreground)]">
              ShiftFlow
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-5xl">
                Workforce staffing software for events, shifts, and real-world operations.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--color-muted-foreground)]">
                Manage events, schedule shifts, assign employees, and keep staffing levels visible from one operational dashboard.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-xl bg-[var(--color-foreground)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] px-5 py-3 text-sm font-medium transition hover:bg-[var(--color-surface-muted)]"
              >
                Create manager account
              </Link>
            </div>
          </div>

          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                  <p className="text-sm text-[var(--color-muted-foreground)]">Active employees</p>
                  <p className="mt-2 text-3xl font-semibold">124</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                  <p className="text-sm text-[var(--color-muted-foreground)]">Open positions</p>
                  <p className="mt-2 text-3xl font-semibold">18</p>
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Summer Music Festival</p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">August 21, 2026 • Seattle</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    14 / 16 staffed
                  </span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-[var(--color-surface-muted)]">
                  <div className="h-2 w-[88%] rounded-full bg-[var(--color-foreground)]" />
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-5">
                <p className="text-sm font-medium">Portfolio-ready MVP foundation</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">
                  Built with Next.js App Router, Prisma, Auth.js, Zod, and production-minded authorization patterns.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
