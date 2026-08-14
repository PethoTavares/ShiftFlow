import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusMessage } from "@/components/ui/status-message";
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
  const upcomingAssignments = employee.assignments.filter((assignment) => assignment.shift.startTime >= now);
  const pastAssignments = employee.assignments.filter((assignment) => assignment.shift.startTime < now);

  return (
    <div className="space-y-8">
      <PageHeader
        title={employee.user.name}
        description={employee.user.email}
        action={
          session.user.role === "MANAGER" ? (
            <div className="flex flex-wrap gap-3">
              <Link href={`/employees/${employee.id}/edit`} className="rounded-xl bg-[var(--color-foreground)] px-4 py-2.5 text-sm font-medium text-white">
                Edit employee
              </Link>
            </div>
          ) : null
        }
      />
      <StatusMessage error={error} success={success} />
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <p className="text-sm text-[var(--color-muted-foreground)]">Status</p>
          <div className="mt-3">
            <Badge variant={employee.status === "ACTIVE" ? "success" : "danger"}>{employee.status}</Badge>
          </div>
        </div>
        <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <p className="text-sm text-[var(--color-muted-foreground)]">Phone</p>
          <p className="mt-3 text-lg font-semibold">{employee.phone}</p>
        </div>
        <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <p className="text-sm text-[var(--color-muted-foreground)]">Upcoming shifts</p>
          <p className="mt-3 text-3xl font-semibold">{upcomingAssignments.length}</p>
        </div>
      </section>

      {session.user.role === "MANAGER" && employee.status === "ACTIVE" ? (
        <ConfirmButton
          action={deactivateEmployee}
          message="Deactivate this employee? Their assignment history will be preserved."
          label="Deactivate employee"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700"
        >
          <input type="hidden" name="employeeId" value={employee.id} />
        </ConfirmButton>
      ) : null}

      <section className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Upcoming shifts</h2>
        <div className="mt-6 space-y-4">
          {upcomingAssignments.length === 0 ? (
            <EmptyState title="No upcoming shifts" description="This employee has no future assignments scheduled." />
          ) : (
            upcomingAssignments.map((assignment) => (
              <div key={assignment.id} className="rounded-2xl border border-[var(--color-border)] p-4">
                <p className="font-medium">{assignment.shift.title}</p>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{assignment.shift.event.name}</p>
                <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">{formatDateTime(assignment.shift.startTime)}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Past shifts</h2>
        <div className="mt-6 space-y-4">
          {pastAssignments.length === 0 ? (
            <EmptyState title="No shift history yet" description="Completed or past assignments will show here." />
          ) : (
            pastAssignments.map((assignment) => (
              <div key={assignment.id} className="rounded-2xl border border-[var(--color-border)] p-4">
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
