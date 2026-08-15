import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StaffingIndicator } from "@/components/ui/staffing-indicator";
import { StatusBadge } from "@/components/ui/status-badge";
import { listScheduleShifts } from "@/features/schedule/queries";
import { requireUser } from "@/lib/auth";
import { formatDateHeading, formatTimeRange } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const session = await requireUser();
  const shifts = await listScheduleShifts(session.user.role, session.user.employeeId);

  const groups = new Map<string, typeof shifts>();

  for (const shift of shifts) {
    const key = formatDateHeading(shift.startTime);
    groups.set(key, [...(groups.get(key) ?? []), shift]);
  }

  return (
    <div className="app-shell">
      <PageHeader
        title="Schedule"
        description={
          session.user.role === "MANAGER"
            ? "Review upcoming work by day and quickly spot staffing gaps."
            : "See your upcoming assignments grouped by day and time."
        }
      />
      {shifts.length === 0 ? (
        <EmptyState title="No upcoming shifts" description="Upcoming scheduled shifts will appear here." />
      ) : (
        <div className="space-y-6">
          {[...groups.entries()].map(([date, entries]) => (
            <section key={date} className="app-panel-section">
              <div className="flex items-center justify-between gap-4">
                <h2 className="app-section-heading">{date}</h2>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {entries.length} {entries.length === 1 ? "shift" : "shifts"}
                </p>
              </div>
              <div className="mt-6 app-card-list">
                {entries.map((shift) => {
                  const activeAssignments = shift.assignments.filter((assignment) => assignment.status !== "CANCELLED").length;

                  return (
                    <div key={shift.id} className="app-list-row">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{shift.title}</p>
                          <p className="text-sm text-[var(--color-muted-foreground)]">{shift.event.name}</p>
                          <p className="text-sm text-[var(--color-muted-foreground)]">
                            {formatTimeRange(shift.startTime, shift.endTime)}
                          </p>
                          {session.user.role === "EMPLOYEE" ? (
                            <p className="text-sm text-[var(--color-muted-foreground)]">{shift.event.location}</p>
                          ) : null}
                        </div>
                        <div className="flex min-w-44 flex-col gap-3">
                          {session.user.role === "MANAGER" ? (
                            <StaffingIndicator assigned={activeAssignments} required={shift.requiredWorkers} compact />
                          ) : null}
                          <div className="md:self-end">
                            <StatusBadge status={shift.status} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
