"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  label: string;
  pendingLabel?: string;
};

export function SubmitButton({ label, pendingLabel }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring inline-flex items-center justify-center rounded-xl bg-[var(--color-foreground)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
    >
      {pending ? pendingLabel ?? "Saving..." : label}
    </button>
  );
}
