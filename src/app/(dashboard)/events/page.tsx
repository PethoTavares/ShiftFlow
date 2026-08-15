import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StaffingIndicator } from "@/components/ui/staffing-indicator";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatusMessage } from "@/components/ui/status-message";
import { isAssignmentActive } from "@/features/assignments/utils";
import { listEvents } from "@/features/events/queries";
import { requireManager } from "@/lib/auth";
import { formatDateRange, getQueryStringMessage } from "@/lib/utils";

type EventsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const filters = ["ALL", "DRAFT", "UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"] as const;

export const dynamic = "force-dynamic";

export default async function EventsPage({ searchParams }: EventsPageProps) {
  await requireManager();
  const resolvedSearchParams = await searchParams;
  const filter = getQueryStringMessage(resolvedSearchParams.status) ?? "ALL";
  const error = getQueryStringMessage(resolvedSearchParams.error);
  const success = getQueryStringMessage(resolvedSearchParams.success);
  const events = await listEvents(filter);

  return (
    <div className="app-shell">
      <PageHeader
        title="Events"
        description="Review staffing demand, monitor progress, and keep every event lifecycle visible at a glance."
        action={<Link href="/events/new" className={buttonVariants({})}>New event</Link>}
      />
      <StatusMessage error={error} success={success} />

      <div className="flex flex-wrap gap-2">
        {filters.map((value) => (
          <Link
            key={value}
            href={value === "ALL" ? "/events" : `/events?status=${value}`}
            className={filter === value ? "app-chip app-chip-active" : "app-chip"}
          >
            {value.replaceAll("_", " ")}
          </Link>
        ))}
      </div>

      <section className="app-panel overflow-hidden">
        {events.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No events found"
              description="Create an event to start planning staffing coverage."
              action={<Link href="/events/new" className={buttonVariants({ variant: "secondary" })}>Create event</Link>}
            />
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Date Range</th>
                    <th>Location</th>
                    <th>Staffing</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => {
                    const assignedCount = event.shifts.reduce(
                      (sum, shift) => sum + shift.assignments.filter((assignment) => isAssignmentActive(assignment.status)).length,
                      0,
                    );
                    const requiredCount = event.shifts.reduce((sum, shift) => sum + shift.requiredWorkers, 0);

                    return (
                      <tr key={event.id}>
                        <td>
                          <Link href={`/events/${event.id}`} className="block">
                            <p className="font-medium">{event.name}</p>
                            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                              {event.shifts.length} shifts
                            </p>
                          </Link>
                        </td>
                        <td className="text-[var(--color-muted-foreground)]">{formatDateRange(event.startDate, event.endDate)}</td>
                        <td className="text-[var(--color-muted-foreground)]">{event.location}</td>
                        <td className="min-w-56">
                          <StaffingIndicator assigned={assignedCount} required={requiredCount || 1} compact />
                        </td>
                        <td>
                          <StatusBadge status={event.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 lg:hidden">
              {events.map((event) => {
                const assignedCount = event.shifts.reduce(
                  (sum, shift) => sum + shift.assignments.filter((assignment) => isAssignmentActive(assignment.status)).length,
                  0,
                );
                const requiredCount = event.shifts.reduce((sum, shift) => sum + shift.requiredWorkers, 0);

                return (
                  <Link key={event.id} href={`/events/${event.id}`} className="app-list-row block">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium">{event.name}</p>
                        <p className="text-sm text-[var(--color-muted-foreground)]">{formatDateRange(event.startDate, event.endDate)}</p>
                        <p className="text-sm text-[var(--color-muted-foreground)]">{event.location}</p>
                      </div>
                      <StatusBadge status={event.status} />
                    </div>
                    <div className="mt-4">
                      <StaffingIndicator assigned={assignedCount} required={requiredCount || 1} compact />
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
