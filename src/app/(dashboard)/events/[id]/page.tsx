import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusMessage } from "@/components/ui/status-message";
import { archiveEvent } from "@/features/events/actions";
import { getEventById } from "@/features/events/queries";
import { requireManager } from "@/lib/auth";
import { formatDate, formatDateTime, getQueryStringMessage } from "@/lib/utils";

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

  const assignedCount = event.shifts.reduce((sum, shift) => sum + shift.assignments.length, 0);
  const requiredCount = event.shifts.reduce((sum, shift) => sum + shift.requiredWorkers, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title={event.name}
        description={`${formatDate(event.startDate)} - ${formatDate(event.endDate)} • ${event.location}`}
        action={
          <div className="flex flex-wrap gap-3">
            <Link href={`/shifts/new?eventId=${event.id}`} className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-medium">
              Create shift
            </Link>
            <Link href={`/events/${event.id}/edit`} className="rounded-xl bg-[var(--color-foreground)] px-4 py-2.5 text-sm font-medium text-white">
              Edit event
            </Link>
          </div>
        }
      />
      <StatusMessage error={error} success={success} />
      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Status", event.status],
          ["Shifts", String(event.shifts.length)],
          ["Assigned employees", String(assignedCount)],
          ["Staffing progress", `${assignedCount} / ${requiredCount || 0}`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
            <p className="text-sm text-[var(--color-muted-foreground)]">{label}</p>
            <p className="mt-3 text-xl font-semibold">{value}</p>
          </div>
        ))}
      </section>
      <section className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Event details</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">
              {event.description || "No event description provided."}
            </p>
          </div>
          <Badge>{event.status}</Badge>
        </div>
        <div className="mt-6">
          <ConfirmButton
            action={archiveEvent}
            message="Archive this event and mark it as cancelled?"
            label="Archive event"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700"
          >
            <input type="hidden" name="eventId" value={event.id} />
          </ConfirmButton>
        </div>
      </section>
      <section className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Associated shifts</h2>
          <Link href={`/shifts/new?eventId=${event.id}`} className="text-sm font-medium text-[var(--color-muted-foreground)]">
            Add shift
          </Link>
        </div>
        <div className="mt-6 space-y-4">
          {event.shifts.length === 0 ? (
            <EmptyState title="No shifts yet" description="Create a shift to begin staffing this event." />
          ) : (
            event.shifts.map((shift) => (
              <Link key={shift.id} href={`/shifts/${shift.id}`} className="block rounded-2xl border border-[var(--color-border)] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">{shift.title}</p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">{formatDateTime(shift.startTime)}</p>
                  </div>
                  <Badge variant={shift.assignments.length >= shift.requiredWorkers ? "success" : "warning"}>
                    {shift.assignments.length} / {shift.requiredWorkers} staffed
                  </Badge>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
