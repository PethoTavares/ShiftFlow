import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-slate-900 text-white hover:bg-slate-800",
  secondary: "border border-[var(--color-border)] bg-white text-[var(--color-foreground)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-panel-muted)]",
  ghost: "bg-transparent text-[var(--color-muted-foreground-strong)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-foreground)]",
  destructive: "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
};

const sizes = {
  default: "h-11 px-4 py-2.5 text-sm",
  sm: "h-9 px-3 py-2 text-sm",
};

export function buttonVariants({
  variant = "primary",
  size = "default",
  className,
}: {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return cn(
    "focus-ring inline-flex items-center justify-center gap-2 rounded-xl font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  );
}
