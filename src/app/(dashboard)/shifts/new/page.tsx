import { PageHeader } from "@/components/ui/page-header";
import { StatusMessage } from "@/components/ui/status-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { createShift } from "@/features/shifts/actions";
import { listShiftEvents } from "@/features/shifts/queries";
import { requireManager } from "@/lib/auth";
import { getQueryStringMessage } from "@/lib/utils";

type NewShiftPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function NewShiftPage({ searchParams }: NewShiftPageProps) {
  await requireManager();
  const events = await listShiftEvents();
  const resolvedSearchParams = await searchParams;
  const error = getQueryStringMessage(resolvedSearchParams.error);
  const selectedEventId = getQueryStringMessage(resolvedSearchParams.eventId) ?? events[0]?.id;

  return (
    <div className="space-y-8">
      <PageHeader title="Create shift" description="Add a shift to an event and define staffing requirements." />
      <section className="max-w-3xl rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <StatusMessage error={error} />
        <form action={createShift} className="mt-6 space-y-5">
          <div className="space-y-2">
            <label htmlFor="eventId" className="text-sm font-medium">Event</label>
            <select id="eventId" name="eventId" defaultValue={selectedEventId} className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5">
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <input id="title" name="title" required className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <textarea id="description" name="description" rows={4} className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="startTime" className="text-sm font-medium">Start time</label>
              <input id="startTime" name="startTime" type="datetime-local" required className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
            </div>
            <div className="space-y-2">
              <label htmlFor="endTime" className="text-sm font-medium">End time</label>
              <input id="endTime" name="endTime" type="datetime-local" required className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="requiredWorkers" className="text-sm font-medium">Required workers</label>
              <input id="requiredWorkers" name="requiredWorkers" type="number" min={1} defaultValue={1} required className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <select id="status" name="status" defaultValue="OPEN" className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5">
                <option value="OPEN">Open</option>
                <option value="FULL">Full</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
          <SubmitButton label="Create shift" pendingLabel="Creating shift..." />
        </form>
      </section>
    </div>
  );
}
