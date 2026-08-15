import { notFound } from "next/navigation";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusMessage } from "@/components/ui/status-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { updateShift } from "@/features/shifts/actions";
import { getShiftById, listShiftEvents } from "@/features/shifts/queries";
import { requireManager } from "@/lib/auth";
import { getQueryStringMessage } from "@/lib/utils";

type EditShiftPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

function toDateTimeLocalString(value: Date) {
  return new Date(value.getTime() - value.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export default async function EditShiftPage({ params, searchParams }: EditShiftPageProps) {
  await requireManager();
  const { id } = await params;
  const shift = await getShiftById(id);

  if (!shift) {
    notFound();
  }

  const events = await listShiftEvents();
  const resolvedSearchParams = await searchParams;
  const error = getQueryStringMessage(resolvedSearchParams.error);

  return (
    <div className="app-shell">
      <PageHeader
        title={`Edit ${shift.title}`}
        description="Update timing, event linkage, capacity, and status."
        action={<Link href={`/shifts/${shift.id}`} className={buttonVariants({ variant: "secondary" })}>Back to shift</Link>}
      />
      <section className="app-panel-section max-w-3xl">
        <StatusMessage error={error} />
        <form action={updateShift} className="mt-6 space-y-5">
          <input type="hidden" name="shiftId" value={shift.id} />
          <div className="space-y-2">
            <label htmlFor="eventId" className="app-label">Event</label>
            <select id="eventId" name="eventId" defaultValue={shift.eventId} className="app-select">
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="title" className="app-label">Title</label>
            <input id="title" name="title" defaultValue={shift.title} required className="app-input" />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="app-label">Description</label>
            <textarea id="description" name="description" rows={4} defaultValue={shift.description ?? ""} className="app-textarea" />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="startTime" className="app-label">Start time</label>
              <input id="startTime" name="startTime" type="datetime-local" defaultValue={toDateTimeLocalString(shift.startTime)} required className="app-input" />
            </div>
            <div className="space-y-2">
              <label htmlFor="endTime" className="app-label">End time</label>
              <input id="endTime" name="endTime" type="datetime-local" defaultValue={toDateTimeLocalString(shift.endTime)} required className="app-input" />
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="requiredWorkers" className="app-label">Required workers</label>
              <input id="requiredWorkers" name="requiredWorkers" type="number" min={1} defaultValue={shift.requiredWorkers} required className="app-input" />
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="app-label">Status</label>
              <select id="status" name="status" defaultValue={shift.status} className="app-select">
                <option value="OPEN">Open</option>
                <option value="FULL">Full</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
          <SubmitButton label="Save changes" pendingLabel="Saving changes..." />
        </form>
      </section>
    </div>
  );
}
