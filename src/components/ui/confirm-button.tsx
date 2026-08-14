"use client";

type ConfirmButtonProps = {
  action: (formData: FormData) => void;
  label: string;
  message: string;
  className?: string;
  children?: React.ReactNode;
};

export function ConfirmButton({ action, label, message, className, children }: ConfirmButtonProps) {
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
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
