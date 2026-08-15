import { PageHeader } from "@/components/ui/page-header";
import { StatusMessage } from "@/components/ui/status-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { createEvent } from "@/features/events/actions";
import { requireManager } from "@/lib/auth";
import { getQueryStringMessage } from "@/lib/utils";
import Link from "next/link";

type NewEventPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function NewEventPage({ searchParams }: NewEventPageProps) {
  await requireManager();
  const resolvedSearchParams = await searchParams;
  const error = getQueryStringMessage(resolvedSearchParams.error);

  return (
    <div className="app-shell">
      <PageHeader
        title="Create event"
        description="Define the event window, location, and lifecycle before staffing shifts against it."
        action={<Link href="/events" className={buttonVariants({ variant: "secondary" })}>Back to events</Link>}
      />
      <section className="app-panel-section max-w-3xl">
        <StatusMessage error={error} />
        <form action={createEvent} className="mt-6 space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="app-label">Name</label>
            <input id="name" name="name" required className="app-input" />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="app-label">Description</label>
            <textarea id="description" name="description" rows={4} className="app-textarea" />
          </div>
          <div className="space-y-2">
            <label htmlFor="location" className="app-label">Location</label>
            <input id="location" name="location" required className="app-input" />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="startDate" className="app-label">Start date</label>
              <input id="startDate" name="startDate" type="datetime-local" required className="app-input" />
            </div>
            <div className="space-y-2">
              <label htmlFor="endDate" className="app-label">End date</label>
              <input id="endDate" name="endDate" type="datetime-local" required className="app-input" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="status" className="app-label">Status</label>
            <select id="status" name="status" defaultValue="DRAFT" className="app-select">
              <option value="DRAFT">Draft</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <SubmitButton label="Create event" pendingLabel="Creating event..." />
        </form>
      </section>
    </div>
  );
}
