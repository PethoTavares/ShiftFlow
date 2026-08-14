import { notFound } from "next/navigation";

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
    <div className="space-y-8">
      <PageHeader title={`Edit ${event.name}`} description="Update event details, dates, location, and lifecycle status." />
      <section className="max-w-3xl rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <StatusMessage error={error} />
        <form action={updateEvent} className="mt-6 space-y-5">
          <input type="hidden" name="eventId" value={event.id} />
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <input id="name" name="name" defaultValue={event.name} required className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <textarea id="description" name="description" rows={4} defaultValue={event.description ?? ""} className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
          </div>
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">Location</label>
            <input id="location" name="location" defaultValue={event.location} required className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="startDate" className="text-sm font-medium">Start date</label>
              <input id="startDate" name="startDate" type="datetime-local" defaultValue={toDateTimeLocalString(event.startDate)} required className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
            </div>
            <div className="space-y-2">
              <label htmlFor="endDate" className="text-sm font-medium">End date</label>
              <input id="endDate" name="endDate" type="datetime-local" defaultValue={toDateTimeLocalString(event.endDate)} required className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">Status</label>
            <select id="status" name="status" defaultValue={event.status} className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5">
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
