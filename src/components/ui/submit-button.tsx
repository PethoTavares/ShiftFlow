"use client";

import { useFormStatus } from "react-dom";

import { buttonVariants } from "@/components/ui/button";

type SubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  className?: string;
};

export function SubmitButton({ label, pendingLabel, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonVariants({ className })}
    >
      {pending ? pendingLabel ?? "Saving..." : label}
    </button>
  );
}
