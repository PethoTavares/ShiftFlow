import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StaffingIndicator } from "@/components/ui/staffing-indicator";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatusMessage } from "@/components/ui/status-message";
import { isAssignmentActive } from "@/features/assignments/utils";
import { getEmployeeDashboardData, getManagerDashboardData } from "@/features/dashboard/queries";
import { requireUser } from "@/lib/auth";
import { formatDate, formatDateHeading, formatDateRange, formatDateTime, formatTimeRange, getQueryStringMessage } from "@/lib/utils";

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await requireUser();
  const resolvedSearchParams = await searchParams;
  const error = getQueryStringMessage(resolvedSearchParams.error);
  const success = getQueryStringMessage(resolvedSearchParams.success);

  if (session.user.role === "MANAGER") {
    const data = await getManagerDashboardData();

    return (
      <div className="app-shell">
        <PageHeader
          title="Operations dashboard"
          description="Monitor staffing levels, upcoming work, and the operational pulse of your active staffing pipeline."
          action={<Link href="/events/new" className={buttonVariants({})}>Create event</Link>}
        />
        <StatusMessage error={error} success={success} />

        <section className="app-stat-grid">
          {[
            ["Active Employees", data.stats.activeEmployees, "Current workforce members available for scheduling"],
            ["Upcoming Events", data.stats.upcomingEvents, "Draft, upcoming, or active events in the calendar"],
            ["Upcoming Shifts", data.stats.upcomingShifts, "Future shift windows that still need monitoring"],
            ["Open Positions", data.stats.openPositions, "Remaining seats across relevant upcoming shifts"],
          ].map(([label, value, helper]) => (
            <div key={label} className="app-panel-section">
              <p className="app-kicker">{label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">{helper}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="app-panel-section">
            <div className="flex items-center justify-between gap-4">
              <h2 className="app-section-heading">Upcoming events</h2>
              <Link href="/events" className="text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                View all
              </Link>
            </div>
            <div className="mt-6 app-card-list">
              {data.events.length === 0 ? (
                <EmptyState
                  title="No upcoming events"
                  description="Create your first event to start planning staffing coverage."
                  action={<Link href="/events/new" className={buttonVariants({ variant: "secondary" })}>Create event</Link>}
                />
              ) : (
                data.events.map((event) => {
                  const assignedCount = event.shifts.reduce(
                    (sum, shift) => sum + shift.assignments.filter((assignment) => isAssignmentActive(assignment.status)).length,
                    0,
                  );
                  const requiredCount = event.shifts.reduce((sum, shift) => sum + shift.requiredWorkers, 0);

                  return (
                    <Link key={event.id} href={`/events/${event.id}`} className="app-list-row block">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{event.name}</p>
                          <p className="text-sm text-[var(--color-muted-foreground)]">
                            {formatDateRange(event.startDate, event.endDate)}
                          </p>
                          <p className="text-sm text-[var(--color-muted-foreground)]">{event.location}</p>
                        </div>
                        <StatusBadge status={event.status} />
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                        <StaffingIndicator assigned={assignedCount} required={requiredCount || 1} compact />
                        <div className="text-sm text-[var(--color-muted-foreground)] md:text-right">
                          <p>{event.shifts.length} shifts</p>
                          <p>{assignedCount} assigned employees</p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          <div className="app-panel-section">
            <div className="flex items-center justify-between gap-4">
              <h2 className="app-section-heading">Upcoming shifts</h2>
              <Link href="/shifts" className="text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                View all
              </Link>
            </div>
            <div className="mt-6 app-card-list">
              {data.shifts.length === 0 ? (
                <EmptyState title="No upcoming shifts" description="Create shifts for your upcoming events." />
              ) : (
                data.shifts.map((shift) => (
                  <Link key={shift.id} href={`/shifts/${shift.id}`} className="app-list-row block">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{shift.title}</p>
                        <p className="text-sm text-[var(--color-muted-foreground)]">{shift.event.name}</p>
                        <p className="text-sm text-[var(--color-muted-foreground)]">
                          {formatDate(shift.startTime)} · {formatTimeRange(shift.startTime, shift.endTime)}
                        </p>
                      </div>
                      <StatusBadge status={shift.status} />
                    </div>
                    <div className="mt-4">
                      <StaffingIndicator
                        assigned={shift.assignments.filter((assignment) => isAssignmentActive(assignment.status)).length}
                        required={shift.requiredWorkers}
                        compact
                      />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  const employeeData = await getEmployeeDashboardData(session.user.employeeId ?? "");

  return (
    <div className="app-shell">
      <PageHeader
        title="My dashboard"
        description="See what is next, where you are scheduled, and which events need your attention."
      />
      <StatusMessage error={error} success={success} />

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="app-panel-section">
          <p className="app-kicker">Next Shift</p>
          {employeeData.nextAssignment ? (
            <div className="mt-3 space-y-2">
              <p className="text-2xl font-semibold tracking-tight">{employeeData.nextAssignment.shift.title}</p>
              <p className="text-sm text-[var(--color-muted-foreground)]">{employeeData.nextAssignment.shift.event.name}</p>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                {formatDateTime(employeeData.nextAssignment.shift.startTime)} · {employeeData.nextAssignment.shift.event.location}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">
              You do not have a future assignment scheduled yet.
            </p>
          )}
        </div>
        <div className="app-panel-section">
          <p className="app-kicker">Upcoming Shifts</p>
          <p className="mt-3 text-3xl font-semibold">{employeeData.assignments.length}</p>
        </div>
        <div className="app-panel-section">
          <p className="app-kicker">Upcoming Events</p>
          <p className="mt-3 text-3xl font-semibold">
            {new Set(employeeData.assignments.map((assignment) => assignment.shift.eventId)).size}
          </p>
        </div>
      </section>

      <section className="app-panel-section">
        <div className="flex items-center justify-between gap-4">
          <h2 className="app-section-heading">My upcoming shifts</h2>
          <Link href="/schedule" className="text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
            View full schedule
          </Link>
        </div>
        <div className="mt-6 app-card-list">
          {employeeData.assignments.length === 0 ? (
            <EmptyState title="No assigned shifts" description="You don't have any upcoming assignments yet." />
          ) : (
            employeeData.assignments.map((assignment) => (
              <div key={assignment.id} className="app-list-row">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{assignment.shift.title}</p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">{assignment.shift.event.name}</p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">{assignment.shift.event.location}</p>
                  </div>
                  <StatusBadge status={assignment.status} />
                </div>
                <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
                  {formatDateHeading(assignment.shift.startTime)} · {formatTimeRange(assignment.shift.startTime, assignment.shift.endTime)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
