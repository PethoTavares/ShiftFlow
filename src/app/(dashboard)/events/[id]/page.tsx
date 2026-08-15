import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StaffingIndicator } from "@/components/ui/staffing-indicator";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatusMessage } from "@/components/ui/status-message";
import { isAssignmentActive } from "@/features/assignments/utils";
import { archiveEvent } from "@/features/events/actions";
import { getEventById } from "@/features/events/queries";
import { requireManager } from "@/lib/auth";
import { formatDateRange, formatDateTime, getQueryStringMessage } from "@/lib/utils";

type EventDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params, searchParams }: EventDetailPageProps) {
  await requireManager();
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const error = getQueryStringMessage(resolvedSearchParams.error);
  const success = getQueryStringMessage(resolvedSearchParams.success);
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const assignedCount = event.shifts.reduce(
    (sum, shift) => sum + shift.assignments.filter((assignment) => isAssignmentActive(assignment.status)).length,
    0,
  );
  const requiredCount = event.shifts.reduce((sum, shift) => sum + shift.requiredWorkers, 0);

  return (
    <div className="app-shell">
      <PageHeader
        title={event.name}
        description={`${formatDateRange(event.startDate, event.endDate)} · ${event.location}`}
        action={
          <div className="flex flex-wrap gap-3">
            <Link href={`/shifts/new?eventId=${event.id}`} className={buttonVariants({ variant: "secondary" })}>
              Create shift
            </Link>
            <Link href={`/events/${event.id}/edit`} className={buttonVariants({})}>
              Edit event
            </Link>
          </div>
        }
      />
      <StatusMessage error={error} success={success} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="app-panel-section">
          <p className="app-kicker">Status</p>
          <div className="mt-3">
            <StatusBadge status={event.status} />
          </div>
        </div>
        <div className="app-panel-section">
          <p className="app-kicker">Date range</p>
          <p className="mt-3 text-lg font-semibold">{formatDateRange(event.startDate, event.endDate)}</p>
        </div>
        <div className="app-panel-section">
          <p className="app-kicker">Location</p>
          <p className="mt-3 text-lg font-semibold">{event.location}</p>
        </div>
        <div className="app-panel-section">
          <p className="app-kicker">Shifts</p>
          <p className="mt-3 text-lg font-semibold">{event.shifts.length}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="app-panel-section">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="app-section-heading">Staffing overview</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">
                Staffing totals across the shifts currently attached to this event.
              </p>
            </div>
            <ConfirmButton
              action={archiveEvent}
              message="Cancel this event? Associated staffing work will no longer appear as upcoming."
              label="Cancel event"
              variant="destructive"
            >
              <input type="hidden" name="eventId" value={event.id} />
            </ConfirmButton>
          </div>
          <div className="mt-6">
            <StaffingIndicator assigned={assignedCount} required={requiredCount || 1} />
          </div>
        </div>

        <div className="app-panel-section">
          <h2 className="app-section-heading">Event details</h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-[var(--color-muted-foreground)]">
            <p>{event.description || "No event description provided yet."}</p>
          </div>
        </div>
      </section>

      <section className="app-panel-section">
        <div className="flex items-center justify-between gap-4">
          <h2 className="app-section-heading">Associated shifts</h2>
          <Link href={`/shifts/new?eventId=${event.id}`} className="text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
            Add shift
          </Link>
        </div>
        <div className="mt-6 app-card-list">
          {event.shifts.length === 0 ? (
            <EmptyState
              title="No shifts yet"
              description="Create a shift to begin staffing this event."
              action={<Link href={`/shifts/new?eventId=${event.id}`} className={buttonVariants({ variant: "secondary" })}>Create shift</Link>}
            />
          ) : (
            event.shifts.map((shift) => (
              <Link key={shift.id} href={`/shifts/${shift.id}`} className="app-list-row block">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{shift.title}</p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">{formatDateTime(shift.startTime)}</p>
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
      </section>
    </div>
  );
}
