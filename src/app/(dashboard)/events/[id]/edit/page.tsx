import { notFound } from "next/navigation";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusMessage } from "@/components/ui/status-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { updateEvent } from "@/features/events/actions";
import { getEventById } from "@/features/events/queries";
import { requireManager } from "@/lib/auth";
import { getQueryStringMessage } from "@/lib/utils";

type EditEventPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

function toDateTimeLocalString(value: Date) {
  return new Date(value.getTime() - value.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export default async function EditEventPage({ params, searchParams }: EditEventPageProps) {
  await requireManager();
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const error = getQueryStringMessage(resolvedSearchParams.error);

  return (
    <div className="app-shell">
      <PageHeader
        title={`Edit ${event.name}`}
        description="Update event details, dates, location, and lifecycle status."
        action={<Link href={`/events/${event.id}`} className={buttonVariants({ variant: "secondary" })}>Back to event</Link>}
      />
      <section className="app-panel-section max-w-3xl">
        <StatusMessage error={error} />
        <form action={updateEvent} className="mt-6 space-y-5">
          <input type="hidden" name="eventId" value={event.id} />
          <div className="space-y-2">
            <label htmlFor="name" className="app-label">Name</label>
            <input id="name" name="name" defaultValue={event.name} required className="app-input" />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="app-label">Description</label>
            <textarea id="description" name="description" rows={4} defaultValue={event.description ?? ""} className="app-textarea" />
          </div>
          <div className="space-y-2">
            <label htmlFor="location" className="app-label">Location</label>
            <input id="location" name="location" defaultValue={event.location} required className="app-input" />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="startDate" className="app-label">Start date</label>
              <input id="startDate" name="startDate" type="datetime-local" defaultValue={toDateTimeLocalString(event.startDate)} required className="app-input" />
            </div>
            <div className="space-y-2">
              <label htmlFor="endDate" className="app-label">End date</label>
              <input id="endDate" name="endDate" type="datetime-local" defaultValue={toDateTimeLocalString(event.endDate)} required className="app-input" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="status" className="app-label">Status</label>
            <select id="status" name="status" defaultValue={event.status} className="app-select">
              <option value="DRAFT">Draft</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <SubmitButton label="Save changes" pendingLabel="Saving changes..." />
        </form>
      </section>
    </div>
  );
}
