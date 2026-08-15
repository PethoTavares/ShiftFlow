import { notFound } from "next/navigation";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusMessage } from "@/components/ui/status-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { updateEmployee } from "@/features/employees/actions";
import { getEmployeeById } from "@/features/employees/queries";
import { requireManager } from "@/lib/auth";
import { getQueryStringMessage } from "@/lib/utils";

type EditEmployeePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function EditEmployeePage({ params, searchParams }: EditEmployeePageProps) {
  await requireManager();
  const { id } = await params;
  const employee = await getEmployeeById(id);

  if (!employee) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const error = getQueryStringMessage(resolvedSearchParams.error);

  return (
    <div className="app-shell">
      <PageHeader
        title={`Edit ${employee.user.name}`}
        description="Update employee profile, account details, and status."
        action={<Link href={`/employees/${employee.id}`} className={buttonVariants({ variant: "secondary" })}>Back to profile</Link>}
      />
      <section className="app-panel-section max-w-3xl">
        <StatusMessage error={error} />
        <form action={updateEmployee} className="mt-6 space-y-5">
          <input type="hidden" name="employeeId" value={employee.id} />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="app-label">Full name</label>
              <input id="name" name="name" defaultValue={employee.user.name} required className="app-input" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="app-label">Email</label>
              <input id="email" name="email" type="email" defaultValue={employee.user.email} required className="app-input" />
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="phone" className="app-label">Phone</label>
              <input id="phone" name="phone" defaultValue={employee.phone ?? ""} required className="app-input" />
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="app-label">Status</label>
              <select id="status" name="status" defaultValue={employee.status} className="app-select">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="app-label">New password</label>
            <input id="password" name="password" type="password" placeholder="Leave blank to keep current password" className="app-input" />
          </div>
          <SubmitButton label="Save changes" pendingLabel="Saving changes..." />
        </form>
      </section>
    </div>
  );
}
