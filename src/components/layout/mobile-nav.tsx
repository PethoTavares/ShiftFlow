"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";

import { SignOutButton } from "@/features/auth/sign-out-button";
import { cn } from "@/lib/utils";
import { getNavigationItems } from "@/components/layout/navigation";
import { buttonVariants } from "@/components/ui/button";

type MobileNavProps = {
  session: Session;
};

export function MobileNav({ session }: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = getNavigationItems(session);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-white/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="text-base font-semibold tracking-tight">
            ShiftFlow
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      {open ? (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="fixed inset-0 z-30 bg-slate-950/30"
            onClick={() => setOpen(false)}
          />
          <aside
            id="mobile-navigation"
            className="fixed inset-y-0 left-0 z-40 flex w-[min(22rem,90vw)] flex-col border-r border-[var(--color-border)] bg-white shadow-2xl"
          >
            <div className="border-b border-[var(--color-border)] px-5 py-5">
              <p className="text-lg font-semibold tracking-tight">ShiftFlow</p>
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                Staffing operations for events and schedules.
              </p>
            </div>
            <nav className="flex-1 space-y-1 px-4 py-5">
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-xl px-3 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-slate-900 text-white"
                        : "text-[var(--color-muted-foreground-strong)] hover:bg-[var(--color-surface-muted)]",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="space-y-4 border-t border-[var(--color-border)] px-4 py-5">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-muted)] px-4 py-3">
                <p className="text-sm font-medium">{session.user.name}</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">{session.user.email}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">
                  {session.user.role}
                </p>
              </div>
              <SignOutButton />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
