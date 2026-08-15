import type { Session } from "next-auth";

export type NavigationItem = {
  href: string;
  label: string;
};

const managerNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/events", label: "Events" },
  { href: "/employees", label: "Employees" },
  { href: "/shifts", label: "Shifts" },
  { href: "/schedule", label: "Schedule" },
  { href: "/settings", label: "Settings" },
];

const employeeNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/schedule", label: "Schedule" },
  { href: "/settings", label: "Settings" },
];

export function getNavigationItems(session: Session) {
  return session.user.role === "MANAGER" ? managerNavigation : employeeNavigation;
}
