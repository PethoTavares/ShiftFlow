import Link from "next/link";
import { redirect } from "next/navigation";

import { SignInForm } from "@/features/auth/sign-in-form";
import { auth } from "@/lib/auth";
import { getQueryStringMessage } from "@/lib/utils";

type SignInPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const success = getQueryStringMessage(resolvedSearchParams.success);

  return (
    <main className="app-auth-shell">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="app-auth-card p-8 lg:p-10">
          <div className="space-y-3">
            <p className="app-kicker">ShiftFlow</p>
            <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">
              Access your staffing dashboard and upcoming assignments.
            </p>
          </div>
          {success ? (
            <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </p>
          ) : null}
          <div className="mt-6">
            <SignInForm />
          </div>
          <p className="mt-6 text-sm text-[var(--color-muted-foreground)]">
            Need a manager account?{" "}
            <Link href="/sign-up" className="font-medium text-[var(--color-foreground)]">
              Create one here
            </Link>
            .
          </p>
        </section>

        <section className="app-panel-muted p-8 lg:p-10">
          <div className="space-y-4">
            <p className="app-kicker">Secure operations</p>
            <h2 className="text-2xl font-semibold tracking-tight">Built for manager control and employee clarity</h2>
          </div>
          <div className="mt-6 space-y-4 text-sm leading-7 text-[var(--color-muted-foreground)]">
            <p>Managers can create employees, events, shifts, and assignments while server-side authorization protects every mutation.</p>
            <p>Employees only see their own upcoming work, keeping the product useful in day-to-day staffing operations without exposing private data.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
