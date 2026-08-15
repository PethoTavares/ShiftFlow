import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StaffingIndicator } from "@/components/ui/staffing-indicator";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatusMessage } from "@/components/ui/status-message";
import { listShifts } from "@/features/shifts/queries";
import { requireManager } from "@/lib/auth";
import { formatDate, formatTimeRange, getQueryStringMessage } from "@/lib/utils";

type ShiftsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const filters = ["ALL", "OPEN", "FULL", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;

export const dynamic = "force-dynamic";

export default async function ShiftsPage({ searchParams }: ShiftsPageProps) {
  await requireManager();
  const resolvedSearchParams = await searchParams;
  const filter = getQueryStringMessage(resolvedSearchParams.status) ?? "ALL";
  const error = getQueryStringMessage(resolvedSearchParams.error);
  const success = getQueryStringMessage(resolvedSearchParams.success);
  const shifts = await listShifts(filter);

  return (
    <div className="app-shell">
      <PageHeader
        title="Shifts"
        description="Track staffing capacity, shift status, and upcoming operational coverage from one screen."
        action={<Link href="/shifts/new" className={buttonVariants({})}>New shift</Link>}
      />
      <StatusMessage error={error} success={success} />

      <div className="flex flex-wrap gap-2">
        {filters.map((value) => (
          <Link
            key={value}
            href={value === "ALL" ? "/shifts" : `/shifts?status=${value}`}
            className={filter === value ? "app-chip app-chip-active" : "app-chip"}
          >
            {value.replaceAll("_", " ")}
          </Link>
        ))}
      </div>

      <section className="app-panel overflow-hidden">
        {shifts.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No shifts found"
              description="Create a shift to begin assigning staff."
              action={<Link href="/shifts/new" className={buttonVariants({ variant: "secondary" })}>Create shift</Link>}
            />
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Shift</th>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Staffing</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((shift) => {
                    const activeAssignments = shift.assignments.filter((assignment) => assignment.status !== "CANCELLED").length;

                    return (
                      <tr key={shift.id}>
                        <td>
                          <Link href={`/shifts/${shift.id}`} className="block">
                            <p className="font-medium">{shift.title}</p>
                            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                              {formatTimeRange(shift.startTime, shift.endTime)}
                            </p>
                          </Link>
                        </td>
                        <td className="text-[var(--color-muted-foreground)]">{shift.event.name}</td>
                        <td className="text-[var(--color-muted-foreground)]">{formatDate(shift.startTime)}</td>
                        <td className="min-w-56">
                          <StaffingIndicator assigned={activeAssignments} required={shift.requiredWorkers} compact />
                        </td>
                        <td>
                          <StatusBadge status={shift.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 lg:hidden">
              {shifts.map((shift) => {
                const activeAssignments = shift.assignments.filter((assignment) => assignment.status !== "CANCELLED").length;

                return (
                  <Link key={shift.id} href={`/shifts/${shift.id}`} className="app-list-row block">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium">{shift.title}</p>
                        <p className="text-sm text-[var(--color-muted-foreground)]">{shift.event.name}</p>
                        <p className="text-sm text-[var(--color-muted-foreground)]">
                          {formatDate(shift.startTime)} · {formatTimeRange(shift.startTime, shift.endTime)}
                        </p>
                      </div>
                      <StatusBadge status={shift.status} />
                    </div>
                    <div className="mt-4">
                      <StaffingIndicator assigned={activeAssignments} required={shift.requiredWorkers} compact />
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
