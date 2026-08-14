import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusMessage } from "@/components/ui/status-message";
import { getEmployeeDashboardData, getManagerDashboardData } from "@/features/dashboard/queries";
import { requireUser } from "@/lib/auth";
import { formatDate, formatDateTime, getQueryStringMessage } from "@/lib/utils";

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
      <div className="space-y-8">
        <PageHeader
          title="Operations dashboard"
          description="Monitor staffing levels, upcoming work, and the operational pulse of your upcoming events."
          action={
            <Link href="/events/new" className="rounded-xl bg-[var(--color-foreground)] px-4 py-2.5 text-sm font-medium text-white">
              Create event
            </Link>
          }
        />
        <StatusMessage error={error} success={success} />
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Active Employees", data.stats.activeEmployees],
            ["Upcoming Events", data.stats.upcomingEvents],
            ["Upcoming Shifts", data.stats.upcomingShifts],
            ["Open Positions", data.stats.openPositions],
          ].map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
              <p className="text-sm text-[var(--color-muted-foreground)]">{label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upcoming events</h2>
              <Link href="/events" className="text-sm font-medium text-[var(--color-muted-foreground)]">
                View all
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {data.events.length === 0 ? (
                <EmptyState title="No upcoming events" description="Create your first event to start staffing work." />
              ) : (
                data.events.map((event) => {
                  const assignedCount = event.shifts.reduce((sum, shift) => sum + shift.assignments.length, 0);

                  return (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="block rounded-2xl border border-[var(--color-border)] p-4 transition hover:bg-[var(--color-surface-muted)]"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-medium">{event.name}</p>
                          <p className="text-sm text-[var(--color-muted-foreground)]">
                            {formatDate(event.startDate)} • {event.location}
                          </p>
                        </div>
                        <Badge variant="neutral">{event.status}</Badge>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-[var(--color-muted-foreground)] md:grid-cols-2">
                        <p>{event.shifts.length} shifts</p>
                        <p>{assignedCount} assigned employees</p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upcoming shifts</h2>
              <Link href="/shifts" className="text-sm font-medium text-[var(--color-muted-foreground)]">
                View all
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {data.shifts.length === 0 ? (
                <EmptyState title="No upcoming shifts" description="Create shifts for your upcoming events." />
              ) : (
                data.shifts.map((shift) => (
                  <Link
                    key={shift.id}
                    href={`/shifts/${shift.id}`}
                    className="block rounded-2xl border border-[var(--color-border)] p-4 transition hover:bg-[var(--color-surface-muted)]"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium">{shift.title}</p>
                        <p className="text-sm text-[var(--color-muted-foreground)]">{shift.event.name}</p>
                      </div>
                      <Badge variant={shift.assignments.length >= shift.requiredWorkers ? "success" : "warning"}>
                        {shift.assignments.length} / {shift.requiredWorkers} staffed
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">{formatDateTime(shift.startTime)}</p>
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
    <div className="space-y-8">
      <PageHeader
        title="My dashboard"
        description="Review your upcoming work, assigned shifts, and event details."
      />
      <StatusMessage error={error} success={success} />
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <p className="text-sm text-[var(--color-muted-foreground)]">My upcoming shifts</p>
          <p className="mt-3 text-3xl font-semibold">{employeeData.assignments.length}</p>
        </div>
        <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <p className="text-sm text-[var(--color-muted-foreground)]">Next shift</p>
          <p className="mt-3 text-lg font-semibold">
            {employeeData.nextAssignment ? employeeData.nextAssignment.shift.title : "No upcoming shifts"}
          </p>
        </div>
        <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <p className="text-sm text-[var(--color-muted-foreground)]">Upcoming events</p>
          <p className="mt-3 text-3xl font-semibold">
            {new Set(employeeData.assignments.map((assignment) => assignment.shift.eventId)).size}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">My upcoming shifts</h2>
        <div className="mt-6 space-y-4">
          {employeeData.assignments.length === 0 ? (
            <EmptyState title="No assigned shifts" description="You don't have any upcoming assignments yet." />
          ) : (
            employeeData.assignments.map((assignment) => (
              <div key={assignment.id} className="rounded-2xl border border-[var(--color-border)] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">{assignment.shift.title}</p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">{assignment.shift.event.name}</p>
                  </div>
                  <Badge variant="success">{assignment.status}</Badge>
                </div>
                <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
                  {formatDateTime(assignment.shift.startTime)} • {assignment.shift.event.location}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
