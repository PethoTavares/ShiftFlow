export default function AuthLoading() {
  return (
    <main className="app-auth-shell">
      <div className="app-auth-card p-8 lg:p-10">
        <div className="space-y-4">
          <div className="h-3 w-24 animate-pulse rounded bg-[var(--color-surface-strong)]" />
          <div className="h-10 w-56 animate-pulse rounded-xl bg-[var(--color-surface-strong)]" />
          <div className="h-4 w-full max-w-md animate-pulse rounded bg-[var(--color-surface-strong)]" />
          <div className="mt-8 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-11 animate-pulse rounded-xl bg-[var(--color-surface-strong)]" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
