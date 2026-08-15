"use client";

import { buttonVariants } from "@/components/ui/button";

type ConfirmButtonProps = {
  action: (formData: FormData) => void;
  label: string;
  message: string;
  className?: string;
  variant?: "secondary" | "destructive";
  children?: React.ReactNode;
};

export function ConfirmButton({ action, label, message, className, variant = "secondary", children }: ConfirmButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {children}
      <button type="submit" className={buttonVariants({ variant, className })}>
        {label}
      </button>
    </form>
  );
}
