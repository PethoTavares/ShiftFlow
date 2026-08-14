 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Session } from "next-auth";

import { SignOutButton } from "@/features/auth/sign-out-button";
import { cn } from "@/lib/utils";

const managerNavigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/events", label: "Events" },
  { href: "/employees", label: "Employees" },
  { href: "/shifts", label: "Shifts" },
  { href: "/schedule", label: "Schedule" },
  { href: "/settings", label: "Settings" },
];

const employeeNavigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/schedule", label: "Schedule" },
  { href: "/settings", label: "Profile" },
];

type SidebarProps = {
  session: Session;
};

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname();
  const items = session.user.role === "MANAGER" ? managerNavigation : employeeNavigation;

  return (
    <aside className="flex h-full w-full flex-col rounded-none border-r border-[var(--color-border)] bg-white lg:w-72">
      <div className="border-b border-[var(--color-border)] px-6 py-6">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          ShiftFlow
        </Link>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          Staffing operations for events and workforce scheduling.
        </p>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-6">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-xl px-3 py-2 text-sm font-medium transition",
              pathname === item.href || pathname.startsWith(`${item.href}/`)
                ? "bg-[var(--color-surface-muted)] text-[var(--color-foreground)]"
                : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-foreground)]",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="space-y-4 border-t border-[var(--color-border)] px-4 py-5">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3">
          <p className="text-sm font-medium">{session.user.name}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{session.user.email}</p>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">
            {session.user.role}
          </p>
        </div>
        <SignOutButton />
      </div>
    </aside>
  );
}
