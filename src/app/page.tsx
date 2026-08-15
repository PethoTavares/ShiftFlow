import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const features = [
  {
    title: "Event planning",
    description: "Create events, manage their lifecycle, and keep staffing work attached to a real operational timeline.",
  },
  {
    title: "Shift scheduling",
    description: "Build shift windows with staffing targets, capacity rules, and clean assignment visibility.",
  },
  {
    title: "Workforce management",
    description: "Manage employee accounts, prevent scheduling conflicts, and protect sensitive data with role-based access.",
  },
  {
    title: "Operational clarity",
    description: "Managers see staffing progress while employees only see the work that belongs to them.",
  },
];

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="app-auth-shell">
      <section className="app-auth-card p-8 lg:p-12">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="app-kicker">ShiftFlow</p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-5xl lg:text-6xl">
                Workforce scheduling without the chaos.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--color-muted-foreground)]">
                Plan events, create shifts, assign staff, and keep workforce operations organized from one secure full-stack application.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/sign-up" className={buttonVariants({})}>
                Get started
              </Link>
              <Link href="/sign-in" className={buttonVariants({ variant: "secondary" })}>
                Sign in
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-muted)] p-5">
                  <h2 className="text-base font-semibold">{feature.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          <section className="app-panel-muted p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="app-kicker">Why it exists</p>
                <h2 className="text-2xl font-semibold tracking-tight">Built around real staffing constraints</h2>
              </div>
              <div className="space-y-4 text-sm leading-7 text-[var(--color-muted-foreground)]">
                <p>ShiftFlow is designed around the problems operations teams actually hit: overlapping schedules, capacity limits, lifecycle changes, and role-specific access.</p>
                <p>The product keeps business rules on the server, uses PostgreSQL for real persistence, and includes automated unit, integration, and end-to-end test coverage.</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5">
                <p className="app-kicker">Core product capabilities</p>
                <ul className="mt-4 space-y-3 text-sm text-[var(--color-muted-foreground-strong)]">
                  <li>Role-based manager and employee accounts</li>
                  <li>Event, shift, and employee management</li>
                  <li>Assignment capacity and overlap enforcement</li>
                  <li>Employee-specific upcoming schedule views</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
