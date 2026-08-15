import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { listScheduleShifts } from "@/features/schedule/queries";
import { requireUser } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const session = await requireUser();
  const shifts = await listScheduleShifts(session.user.role, session.user.employeeId);

  const groups = new Map<string, typeof shifts>();

  for (const shift of shifts) {
    const key = formatDate(shift.startTime, "EEEE, MMM d");
    groups.set(key, [...(groups.get(key) ?? []), shift]);
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Schedule" description="View upcoming work grouped by day in a clean operational schedule." />
      {shifts.length === 0 ? (
        <EmptyState title="No upcoming shifts" description="Upcoming scheduled shifts will appear here." />
      ) : (
        <div className="space-y-6">
          {[...groups.entries()].map(([date, entries]) => (
            <section key={date} className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">{date}</h2>
              <div className="mt-6 space-y-4">
                {entries.map((shift) => (
                  <div key={shift.id} className="rounded-2xl border border-[var(--color-border)] p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium">{shift.title}</p>
                        <p className="text-sm text-[var(--color-muted-foreground)]">{shift.event.name}</p>
                      </div>
                      <p className="text-sm font-medium">
                        {shift.assignments.filter((assignment) => assignment.status !== "CANCELLED").length} / {shift.requiredWorkers}
                      </p>
                    </div>
                    <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
                      {formatDateTime(shift.startTime)} • {shift.status}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
