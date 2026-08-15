import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StaffingIndicator } from "@/components/ui/staffing-indicator";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatusMessage } from "@/components/ui/status-message";
import { assignEmployeeToShift, removeEmployeeFromShift } from "@/features/assignments/actions";
import { getAssignableEmployees } from "@/features/assignments/queries";
import { isEventOpenForAssignments, isShiftOpenForAssignments } from "@/features/assignments/utils";
import { cancelShift } from "@/features/shifts/actions";
import { getShiftById } from "@/features/shifts/queries";
import { requireManager } from "@/lib/auth";
import { formatDate, formatTimeRange, getQueryStringMessage } from "@/lib/utils";

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

  const employees = await getAssignableEmployees(shift.id, search);
  const activeAssignments = shift.assignments.filter((assignment) => assignment.status !== "CANCELLED");
  const canAssign = isShiftOpenForAssignments(shift.status) && isEventOpenForAssignments(shift.event.status);

  return (
    <div className="app-shell">
      <PageHeader
        title={shift.title}
        description={`${shift.event.name} · ${formatDate(shift.startTime)} · ${formatTimeRange(shift.startTime, shift.endTime)}`}
        action={
          <div className="flex flex-wrap gap-3">
            <Link href={`/shifts/${shift.id}/edit`} className={buttonVariants({ variant: "secondary" })}>
              Edit shift
            </Link>
          </div>
        }
      />
      <StatusMessage error={error} success={success} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="app-panel-section">
          <p className="app-kicker">Event</p>
          <p className="mt-3 text-lg font-semibold">{shift.event.name}</p>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{shift.event.location}</p>
        </div>
        <div className="app-panel-section">
          <p className="app-kicker">Schedule</p>
          <p className="mt-3 text-lg font-semibold">{formatDate(shift.startTime)}</p>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{formatTimeRange(shift.startTime, shift.endTime)}</p>
        </div>
        <div className="app-panel-section">
          <p className="app-kicker">Status</p>
          <div className="mt-3">
            <StatusBadge status={shift.status} />
          </div>
        </div>
        <div className="app-panel-section">
          <p className="app-kicker">Staffing</p>
          <div className="mt-3">
            <StaffingIndicator assigned={activeAssignments.length} required={shift.requiredWorkers} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="app-panel-section">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="app-section-heading">Assigned employees</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">
                {activeAssignments.length} assigned for a required total of {shift.requiredWorkers}.
              </p>
            </div>
            <ConfirmButton
              action={cancelShift}
              message="Cancel this shift? Employees will no longer see it in their upcoming schedule."
              label="Cancel shift"
              variant="destructive"
            >
              <input type="hidden" name="shiftId" value={shift.id} />
            </ConfirmButton>
          </div>

          <div className="mt-6 app-card-list">
            {activeAssignments.length === 0 ? (
              <EmptyState title="No employees assigned" description="Assign employees to begin staffing this shift." />
            ) : (
              activeAssignments.map((assignment) => (
                <div key={assignment.id} className="app-list-row">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{assignment.employee.user.name}</p>
                      <p className="text-sm text-[var(--color-muted-foreground)]">{assignment.employee.user.email}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={assignment.status} />
                      <ConfirmButton
                        action={removeEmployeeFromShift}
                        message="Remove this employee from the shift? Staffing counts will be recalculated immediately."
                        label="Remove"
                        variant="secondary"
                      >
                        <input type="hidden" name="assignmentId" value={assignment.id} />
                      </ConfirmButton>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="app-panel-section">
          <h2 className="app-section-heading">Assign employee</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">
            Only active employees who are not already assigned to this shift appear here.
          </p>

          {canAssign ? (
            <>
              <form method="get" className="mt-5">
                <label htmlFor="search" className="app-label">Search employees</label>
                <input id="search" name="search" defaultValue={search} className="app-input mt-2" placeholder="Search by name or email" />
              </form>

              {employees.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    title="No eligible employees"
                    description={search ? "No active employee matched that search for this shift." : "All currently eligible employees are already assigned or unavailable."}
                  />
                </div>
              ) : (
                <form action={assignEmployeeToShift} className="mt-6 space-y-4">
                  <input type="hidden" name="shiftId" value={shift.id} />
                  <div className="space-y-2">
                    <label htmlFor="employeeId" className="app-label">Employee</label>
                    <select id="employeeId" name="employeeId" className="app-select">
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.user.name} - {employee.user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <SubmitAssignmentButton />
                </form>
              )}
            </>
          ) : (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
              Assignments are unavailable because this shift or its parent event is no longer open for staffing.
            </div>
          )}
        </div>
      </section>

      {shift.description ? (
        <section className="app-panel-section">
          <h2 className="app-section-heading">Shift notes</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted-foreground)]">{shift.description}</p>
        </section>
      ) : null}
    </div>
  );
}

function SubmitAssignmentButton() {
  return (
    <button type="submit" className={buttonVariants({ className: "w-full" })}>
      Assign employee
    </button>
  );
}
