export default function DashboardLoading() {
  return (
    <div className="app-page-padding">
      <div className="app-shell">
        <div className="space-y-3">
          <div className="h-10 w-64 animate-pulse rounded-xl bg-[var(--color-surface-strong)]" />
          <div className="h-5 w-full max-w-2xl animate-pulse rounded-lg bg-[var(--color-surface-strong)]" />
        </div>
        <div className="app-stat-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="app-panel-section">
              <div className="h-3 w-24 animate-pulse rounded bg-[var(--color-surface-strong)]" />
              <div className="mt-4 h-9 w-16 animate-pulse rounded bg-[var(--color-surface-strong)]" />
              <div className="mt-4 h-4 w-full animate-pulse rounded bg-[var(--color-surface-strong)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
