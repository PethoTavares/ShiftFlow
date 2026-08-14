import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusMessage } from "@/components/ui/status-message";
import { listEvents } from "@/features/events/queries";
import { requireManager } from "@/lib/auth";
import { formatDate, getQueryStringMessage } from "@/lib/utils";

type EventsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function EventsPage({ searchParams }: EventsPageProps) {
  await requireManager();
  const resolvedSearchParams = await searchParams;
  const filter = getQueryStringMessage(resolvedSearchParams.status) ?? "ALL";
  const error = getQueryStringMessage(resolvedSearchParams.error);
  const success = getQueryStringMessage(resolvedSearchParams.success);
  const events = await listEvents(filter);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Events"
        description="Create, review, and manage the events your staffing team supports."
        action={
          <Link href="/events/new" className="rounded-xl bg-[var(--color-foreground)] px-4 py-2.5 text-sm font-medium text-white">
            New event
          </Link>
        }
      />
      <StatusMessage error={error} success={success} />
      <div className="flex flex-wrap gap-2">
        {["ALL", "UPCOMING", "COMPLETED", "CANCELLED"].map((value) => (
          <Link
            key={value}
            href={value === "ALL" ? "/events" : `/events?status=${value}`}
            className={`rounded-full px-3 py-1.5 text-sm ${filter === value ? "bg-[var(--color-foreground)] text-white" : "border border-[var(--color-border)] bg-white"}`}
          >
            {value}
          </Link>
        ))}
      </div>
      <section className="rounded-3xl border border-[var(--color-border)] bg-white shadow-sm">
        {events.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No events found" description="Create an event to start building your staffing calendar." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--color-border)] text-[var(--color-muted-foreground)]">
                <tr>
                  <th className="px-6 py-4 font-medium">Event</th>
                  <th className="px-6 py-4 font-medium">Dates</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Shifts</th>
                  <th className="px-6 py-4 font-medium">Assigned</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const assignedCount = event.shifts.reduce((sum, shift) => sum + shift.assignments.length, 0);

                  return (
                    <tr key={event.id} className="border-b border-[var(--color-border)] last:border-b-0">
                      <td className="px-6 py-4">
                        <Link href={`/events/${event.id}`} className="block">
                          <p className="font-medium">{event.name}</p>
                          <div className="mt-2">
                            <Badge>{event.status}</Badge>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-muted-foreground)]">
                        {formatDate(event.startDate)} - {formatDate(event.endDate)}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-muted-foreground)]">{event.location}</td>
                      <td className="px-6 py-4 text-[var(--color-muted-foreground)]">{event.shifts.length}</td>
                      <td className="px-6 py-4 text-[var(--color-muted-foreground)]">{assignedCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
