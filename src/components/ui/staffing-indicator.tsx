import { cn } from "@/lib/utils";

type StaffingIndicatorProps = {
  assigned: number;
  required: number;
  compact?: boolean;
};

export function StaffingIndicator({ assigned, required, compact = false }: StaffingIndicatorProps) {
  const safeRequired = Math.max(required, 1);
  const percentage = Math.min((assigned / safeRequired) * 100, 100);
  const remaining = Math.max(required - assigned, 0);

  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      <div className="flex items-center justify-between gap-3">
        <p className={cn("font-medium text-[var(--color-foreground)]", compact ? "text-sm" : "text-base")}>
          {assigned} / {required} staffed
        </p>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
          {remaining === 0 ? "At capacity" : `${remaining} open`}
        </p>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-muted)]"
        aria-hidden="true"
      >
        <div
          className={cn(
            "h-full rounded-full transition-all",
            remaining === 0 ? "bg-emerald-600" : "bg-slate-900",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
