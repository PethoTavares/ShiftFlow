import { PageHeader } from "@/components/ui/page-header";
import { StatusMessage } from "@/components/ui/status-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { createShift } from "@/features/shifts/actions";
import { listShiftEvents } from "@/features/shifts/queries";
import { requireManager } from "@/lib/auth";
import { getQueryStringMessage } from "@/lib/utils";
import Link from "next/link";

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
    <div className="app-shell">
      <PageHeader
        title="Create shift"
        description="Add a staffing window to an eligible event and set the operational capacity clearly."
        action={<Link href="/shifts" className={buttonVariants({ variant: "secondary" })}>Back to shifts</Link>}
      />
      <section className="app-panel-section max-w-3xl">
        <StatusMessage error={error} />
        <form action={createShift} className="mt-6 space-y-5">
          <div className="space-y-2">
            <label htmlFor="eventId" className="app-label">Event</label>
            <select id="eventId" name="eventId" defaultValue={selectedEventId} className="app-select">
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="title" className="app-label">Title</label>
            <input id="title" name="title" required className="app-input" />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="app-label">Description</label>
            <textarea id="description" name="description" rows={4} className="app-textarea" />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="startTime" className="app-label">Start time</label>
              <input id="startTime" name="startTime" type="datetime-local" required className="app-input" />
            </div>
            <div className="space-y-2">
              <label htmlFor="endTime" className="app-label">End time</label>
              <input id="endTime" name="endTime" type="datetime-local" required className="app-input" />
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="requiredWorkers" className="app-label">Required workers</label>
              <input id="requiredWorkers" name="requiredWorkers" type="number" min={1} defaultValue={1} required className="app-input" />
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="app-label">Status</label>
              <select id="status" name="status" defaultValue="OPEN" className="app-select">
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
