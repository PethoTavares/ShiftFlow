import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusMessage } from "@/components/ui/status-message";
import { listShifts } from "@/features/shifts/queries";
import { requireManager } from "@/lib/auth";
import { formatDateTime, getQueryStringMessage } from "@/lib/utils";

type ShiftsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function ShiftsPage({ searchParams }: ShiftsPageProps) {
  await requireManager();
  const resolvedSearchParams = await searchParams;
  const filter = getQueryStringMessage(resolvedSearchParams.status) ?? "ALL";
  const error = getQueryStringMessage(resolvedSearchParams.error);
  const success = getQueryStringMessage(resolvedSearchParams.success);
  const shifts = await listShifts(filter);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Shifts"
        description="Track staffing coverage, shift capacity, and upcoming work windows."
        action={
          <Link href="/shifts/new" className="rounded-xl bg-[var(--color-foreground)] px-4 py-2.5 text-sm font-medium text-white">
            New shift
          </Link>
        }
      />
      <StatusMessage error={error} success={success} />
      <div className="flex flex-wrap gap-2">
        {["ALL", "OPEN", "FULL", "COMPLETED", "CANCELLED"].map((value) => (
          <Link
            key={value}
            href={value === "ALL" ? "/shifts" : `/shifts?status=${value}`}
            className={`rounded-full px-3 py-1.5 text-sm ${filter === value ? "bg-[var(--color-foreground)] text-white" : "border border-[var(--color-border)] bg-white"}`}
          >
            {value}
          </Link>
        ))}
      </div>
      <section className="rounded-3xl border border-[var(--color-border)] bg-white shadow-sm">
        {shifts.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No shifts found" description="Create a shift to begin assigning staff." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--color-border)] text-[var(--color-muted-foreground)]">
                <tr>
                  <th className="px-6 py-4 font-medium">Shift</th>
                  <th className="px-6 py-4 font-medium">Event</th>
                  <th className="px-6 py-4 font-medium">Date / time</th>
                  <th className="px-6 py-4 font-medium">Staffing</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => (
                  <tr key={shift.id} className="border-b border-[var(--color-border)] last:border-b-0">
                    <td className="px-6 py-4">
                      <Link href={`/shifts/${shift.id}`} className="font-medium">
                        {shift.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-muted-foreground)]">{shift.event.name}</td>
                    <td className="px-6 py-4 text-[var(--color-muted-foreground)]">{formatDateTime(shift.startTime)}</td>
                    <td className="px-6 py-4 text-[var(--color-muted-foreground)]">
                      {shift.assignments.filter((assignment) => assignment.status !== "CANCELLED").length} / {shift.requiredWorkers}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={shift.status === "FULL" ? "success" : shift.status === "CANCELLED" ? "danger" : "warning"}>
                        {shift.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
