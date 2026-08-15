"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Session } from "next-auth";

import { SignOutButton } from "@/features/auth/sign-out-button";
import { cn } from "@/lib/utils";
import { getNavigationItems } from "@/components/layout/navigation";

type SidebarProps = {
  session: Session;
};

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname();
  const items = getNavigationItems(session);

  return (
    <aside className="flex h-full w-full flex-col border-r border-[var(--color-border)] bg-white/95 backdrop-blur lg:w-72">
      <div className="border-b border-[var(--color-border)] px-6 py-7">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          ShiftFlow
        </Link>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">
          Workforce scheduling for events, shift coverage, and operational staffing.
        </p>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-6">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-xl px-3 py-2.5 text-sm font-medium transition",
              pathname === item.href || pathname.startsWith(`${item.href}/`)
                ? "bg-slate-900 text-white"
                : "text-[var(--color-muted-foreground-strong)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-foreground)]",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="space-y-4 border-t border-[var(--color-border)] px-4 py-5">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-muted)] px-4 py-4">
          <p className="text-sm font-medium">{session.user.name}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{session.user.email}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">
            {session.user.role}
          </p>
        </div>
        <SignOutButton />
      </div>
    </aside>
  );
}
