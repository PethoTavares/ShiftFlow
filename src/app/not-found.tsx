import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-[var(--color-border)] bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-[var(--color-muted-foreground)]">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">
          The page you requested doesn&apos;t exist or may have moved.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-[var(--color-foreground)] px-4 py-2 text-sm font-medium text-white"
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
