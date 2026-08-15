import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatusMessage } from "@/components/ui/status-message";
import { isAssignmentActive } from "@/features/assignments/utils";
import { deactivateEmployee } from "@/features/employees/actions";
import { getEmployeeById } from "@/features/employees/queries";
import { requireEmployeeSelf, requireUser } from "@/lib/auth";
import { formatDateTime, getQueryStringMessage } from "@/lib/utils";

type EmployeeDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function EmployeeDetailPage({ params, searchParams }: EmployeeDetailPageProps) {
  const session = await requireUser();
  const { id } = await params;
  const employee = await getEmployeeById(id);

  if (!employee) {
    notFound();
  }

  await requireEmployeeSelf(employee.id);

  const resolvedSearchParams = await searchParams;
  const error = getQueryStringMessage(resolvedSearchParams.error);
  const success = getQueryStringMessage(resolvedSearchParams.success);
  const now = new Date();
  const upcomingAssignments = employee.assignments.filter(
    (assignment) =>
      isAssignmentActive(assignment.status) &&
      assignment.shift.startTime >= now &&
      !["CANCELLED", "COMPLETED"].includes(assignment.shift.status) &&
      !["CANCELLED", "COMPLETED"].includes(assignment.shift.event.status),
  );
  const pastAssignments = employee.assignments.filter(
    (assignment) =>
      assignment.shift.startTime < now ||
      assignment.shift.status === "COMPLETED" ||
      assignment.shift.event.status === "COMPLETED",
  );

  return (
    <div className="app-shell">
      <PageHeader
        title={employee.user.name}
        description={employee.user.email}
        action={
          session.user.role === "MANAGER" ? (
            <Link href={`/employees/${employee.id}/edit`} className={buttonVariants({})}>
              Edit employee
            </Link>
          ) : null
        }
      />
      <StatusMessage error={error} success={success} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="app-panel-section">
          <p className="app-kicker">Status</p>
          <div className="mt-3">
            <StatusBadge status={employee.status} />
          </div>
        </div>
        <div className="app-panel-section">
          <p className="app-kicker">Phone</p>
          <p className="mt-3 text-lg font-semibold">{employee.phone || "Not provided"}</p>
        </div>
        <div className="app-panel-section">
          <p className="app-kicker">Upcoming shifts</p>
          <p className="mt-3 text-3xl font-semibold">{upcomingAssignments.length}</p>
        </div>
        <div className="app-panel-section">
          <p className="app-kicker">Past shifts</p>
          <p className="mt-3 text-3xl font-semibold">{pastAssignments.length}</p>
        </div>
      </section>

      {session.user.role === "MANAGER" && employee.status === "ACTIVE" ? (
        <ConfirmButton
          action={deactivateEmployee}
          message="Deactivate this employee? Future assignments must be removed first."
          label="Deactivate employee"
          variant="destructive"
        >
          <input type="hidden" name="employeeId" value={employee.id} />
        </ConfirmButton>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="app-panel-section">
          <h2 className="app-section-heading">Profile</h2>
          <div className="mt-6 space-y-5">
            <div>
              <p className="app-kicker">Name</p>
              <p className="mt-2 font-medium">{employee.user.name}</p>
            </div>
            <div>
              <p className="app-kicker">Email</p>
              <p className="mt-2 font-medium">{employee.user.email}</p>
            </div>
            <div>
              <p className="app-kicker">Employment status</p>
              <div className="mt-2">
                <StatusBadge status={employee.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="app-panel-section">
          <h2 className="app-section-heading">Upcoming shifts</h2>
          <div className="mt-6 app-card-list">
            {upcomingAssignments.length === 0 ? (
              <EmptyState title="No upcoming shifts" description="This employee has no future assignments scheduled." />
            ) : (
              upcomingAssignments.map((assignment) => (
                <div key={assignment.id} className="app-list-row">
                  <p className="font-medium">{assignment.shift.title}</p>
                  <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{assignment.shift.event.name}</p>
                  <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">{formatDateTime(assignment.shift.startTime)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="app-panel-section">
        <h2 className="app-section-heading">Past work</h2>
        <div className="mt-6 app-card-list">
          {pastAssignments.length === 0 ? (
            <EmptyState title="No shift history yet" description="Completed or past assignments will show here." />
          ) : (
            pastAssignments.map((assignment) => (
              <div key={assignment.id} className="app-list-row">
                <p className="font-medium">{assignment.shift.title}</p>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{assignment.shift.event.name}</p>
                <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">{formatDateTime(assignment.shift.startTime)}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
