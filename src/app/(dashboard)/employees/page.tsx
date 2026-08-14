import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusMessage } from "@/components/ui/status-message";
import { listEmployees } from "@/features/employees/queries";
import { requireManager } from "@/lib/auth";
import { getQueryStringMessage } from "@/lib/utils";

type EmployeesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  await requireManager();
  const resolvedSearchParams = await searchParams;
  const filter = getQueryStringMessage(resolvedSearchParams.status) ?? "ALL";
  const error = getQueryStringMessage(resolvedSearchParams.error);
  const success = getQueryStringMessage(resolvedSearchParams.success);
  const employees = await listEmployees(filter);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Employees"
        description="Manage your workforce roster, profile details, and staffing availability."
        action={
          <Link href="/employees/new" className="rounded-xl bg-[var(--color-foreground)] px-4 py-2.5 text-sm font-medium text-white">
            New employee
          </Link>
        }
      />
      <StatusMessage error={error} success={success} />
      <div className="flex flex-wrap gap-2">
        {["ALL", "ACTIVE", "INACTIVE"].map((value) => (
          <Link
            key={value}
            href={value === "ALL" ? "/employees" : `/employees?status=${value}`}
            className={`rounded-full px-3 py-1.5 text-sm ${filter === value ? "bg-[var(--color-foreground)] text-white" : "border border-[var(--color-border)] bg-white"}`}
          >
            {value}
          </Link>
        ))}
      </div>
      <section className="rounded-3xl border border-[var(--color-border)] bg-white shadow-sm">
        {employees.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No employees found" description="Add employees to begin assigning them to shifts." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--color-border)] text-[var(--color-muted-foreground)]">
                <tr>
                  <th className="px-6 py-4 font-medium">Employee</th>
                  <th className="px-6 py-4 font-medium">Phone</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Upcoming shifts</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-b border-[var(--color-border)] last:border-b-0">
                    <td className="px-6 py-4">
                      <Link href={`/employees/${employee.id}`} className="block">
                        <p className="font-medium">{employee.user.name}</p>
                        <p className="text-[var(--color-muted-foreground)]">{employee.user.email}</p>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-muted-foreground)]">{employee.phone}</td>
                    <td className="px-6 py-4">
                      <Badge variant={employee.status === "ACTIVE" ? "success" : "danger"}>{employee.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-muted-foreground)]">{employee.assignments.length}</td>
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
