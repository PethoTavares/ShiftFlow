import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatusMessage } from "@/components/ui/status-message";
import { listEmployees } from "@/features/employees/queries";
import { requireManager } from "@/lib/auth";
import { getQueryStringMessage } from "@/lib/utils";

type EmployeesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const filters = ["ALL", "ACTIVE", "INACTIVE"] as const;

export const dynamic = "force-dynamic";

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  await requireManager();
  const resolvedSearchParams = await searchParams;
  const filter = getQueryStringMessage(resolvedSearchParams.status) ?? "ALL";
  const search = getQueryStringMessage(resolvedSearchParams.search) ?? "";
  const error = getQueryStringMessage(resolvedSearchParams.error);
  const success = getQueryStringMessage(resolvedSearchParams.success);
  const employees = await listEmployees(filter, search);

  return (
    <div className="app-shell">
      <PageHeader
        title="Employees"
        description="Manage your workforce roster, check availability, and keep employee details clean and actionable."
        action={<Link href="/employees/new" className={buttonVariants({})}>New employee</Link>}
      />
      <StatusMessage error={error} success={success} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((value) => (
            <Link
              key={value}
              href={value === "ALL" ? `/employees${search ? `?search=${encodeURIComponent(search)}` : ""}` : `/employees?status=${value}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
              className={filter === value ? "app-chip app-chip-active" : "app-chip"}
            >
              {value}
            </Link>
          ))}
        </div>

        <form className="w-full max-w-sm">
          <label htmlFor="search" className="sr-only">Search employees</label>
          <input
            id="search"
            name="search"
            defaultValue={search}
            placeholder="Search by name or email"
            className="app-input"
          />
        </form>
      </div>

      <section className="app-panel overflow-hidden">
        {employees.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No employees found"
              description={search ? "Try a different search or clear the filter." : "Add employees to begin assigning them to shifts."}
              action={!search ? <Link href="/employees/new" className={buttonVariants({ variant: "secondary" })}>Add employee</Link> : undefined}
            />
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Upcoming Shifts</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <Link href={`/employees/${employee.id}`} className="block">
                          <p className="font-medium">{employee.user.name}</p>
                          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{employee.user.email}</p>
                        </Link>
                      </td>
                      <td className="text-[var(--color-muted-foreground)]">{employee.phone || "Not provided"}</td>
                      <td>
                        <StatusBadge status={employee.status} />
                      </td>
                      <td className="text-[var(--color-muted-foreground)]">{employee.assignments.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 lg:hidden">
              {employees.map((employee) => (
                <Link key={employee.id} href={`/employees/${employee.id}`} className="app-list-row block">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium">{employee.user.name}</p>
                      <p className="text-sm text-[var(--color-muted-foreground)]">{employee.user.email}</p>
                      <p className="text-sm text-[var(--color-muted-foreground)]">{employee.phone || "No phone listed"}</p>
                    </div>
                    <StatusBadge status={employee.status} />
                  </div>
                  <p className="mt-4 text-sm text-[var(--color-muted-foreground)]">
                    {employee.assignments.length} upcoming {employee.assignments.length === 1 ? "shift" : "shifts"}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
