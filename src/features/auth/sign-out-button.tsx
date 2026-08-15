"use client";

import { signOut } from "next-auth/react";

import { buttonVariants } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/sign-in" })}
      className={buttonVariants({ variant: "secondary", className: "w-full" })}
    >
      Sign out
    </button>
  );
}
