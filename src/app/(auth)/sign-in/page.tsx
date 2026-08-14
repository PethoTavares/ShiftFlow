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
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-[var(--color-border)] bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--color-muted-foreground)]">ShiftFlow</p>
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
      </div>
    </main>
  );
}
