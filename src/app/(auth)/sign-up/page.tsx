import Link from "next/link";
import { redirect } from "next/navigation";

import { SubmitButton } from "@/components/ui/submit-button";
import { StatusMessage } from "@/components/ui/status-message";
import { signUpManager } from "@/features/auth/actions";
import { auth } from "@/lib/auth";
import { getQueryStringMessage } from "@/lib/utils";

type SignUpPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const error = getQueryStringMessage(resolvedSearchParams.error);

  return (
    <main className="app-auth-shell">
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <section className="app-auth-card p-8 lg:p-10">
          <div className="space-y-3">
            <p className="app-kicker">ShiftFlow</p>
            <h1 className="text-3xl font-semibold tracking-tight">Create manager account</h1>
            <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">
              Start with a manager account and build your staffing workspace from there.
            </p>
          </div>
          <div className="mt-6">
            <StatusMessage error={error} />
          </div>
          <form action={signUpManager} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="app-label">
                Name
              </label>
              <input id="name" name="name" required className="app-input" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="app-label">
                Email
              </label>
              <input id="email" name="email" type="email" required className="app-input" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="app-label">
                Password
              </label>
              <input id="password" name="password" type="password" required className="app-input" />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="app-label">
                Confirm password
              </label>
              <input id="confirmPassword" name="confirmPassword" type="password" required className="app-input" />
            </div>
            <SubmitButton label="Create account" pendingLabel="Creating account..." className="w-full" />
          </form>
          <p className="mt-6 text-sm text-[var(--color-muted-foreground)]">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-[var(--color-foreground)]">
              Sign in
            </Link>
            .
          </p>
        </section>

        <section className="app-panel-muted p-8 lg:p-10">
          <div className="space-y-4">
            <p className="app-kicker">What you get</p>
            <h2 className="text-2xl font-semibold tracking-tight">A realistic full-stack staffing workflow</h2>
          </div>
          <ul className="mt-6 space-y-4 text-sm leading-7 text-[var(--color-muted-foreground)]">
            <li>Create employees and control account status.</li>
            <li>Manage events, shifts, and staffing demand.</li>
            <li>Prevent duplicate assignments, overlaps, and over-capacity scheduling.</li>
            <li>Keep employees focused on their own upcoming work only.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
