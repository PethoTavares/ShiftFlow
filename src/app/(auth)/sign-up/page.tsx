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
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-[var(--color-border)] bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--color-muted-foreground)]">ShiftFlow</p>
          <h1 className="text-3xl font-semibold tracking-tight">Create manager account</h1>
          <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">
            Set up a manager account to start staffing events and scheduling shifts.
          </p>
        </div>
        <div className="mt-6">
          <StatusMessage error={error} />
        </div>
        <form action={signUpManager} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <input id="name" name="name" required className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input id="email" name="email" type="email" required className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input id="password" name="password" type="password" required className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm password
            </label>
            <input id="confirmPassword" name="confirmPassword" type="password" required className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
          </div>
          <SubmitButton label="Create account" pendingLabel="Creating account..." />
        </form>
        <p className="mt-6 text-sm text-[var(--color-muted-foreground)]">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-[var(--color-foreground)]">
            Sign in
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
