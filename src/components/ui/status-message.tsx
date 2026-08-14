type StatusMessageProps = {
  error?: string | null;
  success?: string | null;
};

export function StatusMessage({ error, success }: StatusMessageProps) {
  if (!error && !success) {
    return null;
  }

  const classes = error
    ? "border-rose-200 bg-rose-50 text-rose-700"
    : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return <p className={`rounded-2xl border px-4 py-3 text-sm ${classes}`}>{error ?? success}</p>;
}
