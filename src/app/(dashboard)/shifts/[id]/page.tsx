import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusMessage } from "@/components/ui/status-message";
import { assignEmployeeToShift, removeEmployeeFromShift } from "@/features/assignments/actions";
import { getAssignableEmployees } from "@/features/assignments/queries";
import { cancelShift } from "@/features/shifts/actions";
import { getShiftById } from "@/features/shifts/queries";
import { requireManager } from "@/lib/auth";
import { formatDateTime, getQueryStringMessage } from "@/lib/utils";

type ShiftDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function ShiftDetailPage({ params, searchParams }: ShiftDetailPageProps) {
  await requireManager();
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const error = getQueryStringMessage(resolvedSearchParams.error);
  const success = getQueryStringMessage(resolvedSearchParams.success);
  const search = getQueryStringMessage(resolvedSearchParams.search) ?? "";
  const shift = await getShiftById(id);

  if (!shift) {
    notFound();
  }

  const employees = await getAssignableEmployees(search);
  const activeAssignments = shift.assignments.filter((assignment) => assignment.status !== "CANCELLED");

  return (
    <div className="space-y-8">
      <PageHeader
        title={shift.title}
        description={`${shift.event.name} • ${formatDateTime(shift.startTime)}`}
        action={
          <div className="flex flex-wrap gap-3">
            <Link href={`/shifts/${shift.id}/edit`} className="rounded-xl bg-[var(--color-foreground)] px-4 py-2.5 text-sm font-medium text-white">
              Edit shift
            </Link>
          </div>
        }
      />
      <StatusMessage error={error} success={success} />
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <p className="text-sm text-[var(--color-muted-foreground)]">Event</p>
          <p className="mt-3 text-lg font-semibold">{shift.event.name}</p>
        </div>
        <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <p className="text-sm text-[var(--color-muted-foreground)]">Staffing</p>
          <p className="mt-3 text-lg font-semibold">
            {activeAssignments.length} / {shift.requiredWorkers}
          </p>
        </div>
        <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <p className="text-sm text-[var(--color-muted-foreground)]">Status</p>
          <div className="mt-3">
            <Badge variant={shift.status === "FULL" ? "success" : shift.status === "CANCELLED" ? "danger" : "warning"}>
              {shift.status}
            </Badge>
          </div>
        </div>
        <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <p className="text-sm text-[var(--color-muted-foreground)]">Window</p>
          <p className="mt-3 text-sm font-medium">{formatDateTime(shift.startTime)}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Assigned employees</h2>
            <ConfirmButton
              action={cancelShift}
              message="Cancel this shift?"
              label="Cancel shift"
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700"
            >
              <input type="hidden" name="shiftId" value={shift.id} />
            </ConfirmButton>
          </div>
          <div className="mt-6 space-y-4">
            {activeAssignments.length === 0 ? (
              <EmptyState title="No employees assigned" description="Assign employees to start filling this shift." />
            ) : (
              activeAssignments.map((assignment) => (
                <div key={assignment.id} className="rounded-2xl border border-[var(--color-border)] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium">{assignment.employee.user.name}</p>
                      <p className="text-sm text-[var(--color-muted-foreground)]">{assignment.employee.user.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={assignment.status === "CONFIRMED" ? "success" : "neutral"}>{assignment.status}</Badge>
                      <ConfirmButton
                        action={removeEmployeeFromShift}
                        message="Remove this employee from the shift?"
                        label="Remove"
                        className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm"
                      >
                        <input type="hidden" name="shiftId" value={shift.id} />
                        <input type="hidden" name="assignmentId" value={assignment.id} />
                      </ConfirmButton>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Assign employee</h2>
          <form method="get" className="mt-4">
            <label htmlFor="search" className="text-sm font-medium">Search employees</label>
            <input id="search" name="search" defaultValue={search} className="focus-ring mt-2 w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
          </form>
          <form action={assignEmployeeToShift} className="mt-6 space-y-4">
            <input type="hidden" name="shiftId" value={shift.id} />
            <div className="space-y-2">
              <label htmlFor="employeeId" className="text-sm font-medium">Employee</label>
              <select id="employeeId" name="employeeId" className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5">
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.user.name} • {employee.user.email}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
              <input type="checkbox" name="overrideCapacity" />
              Allow over-capacity assignment
            </label>
            <SubmitAssignmentButton />
          </form>
        </div>
      </section>
    </div>
  );
}

function SubmitAssignmentButton() {
  return (
    <button
      type="submit"
      className="focus-ring inline-flex items-center justify-center rounded-xl bg-[var(--color-foreground)] px-4 py-2.5 text-sm font-medium text-white"
    >
      Assign employee
    </button>
  );
}
