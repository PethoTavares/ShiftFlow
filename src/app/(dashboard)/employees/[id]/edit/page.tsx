import { notFound } from "next/navigation";

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
    <div className="space-y-8">
      <PageHeader title={`Edit ${employee.user.name}`} description="Update employee profile, account details, and status." />
      <section className="max-w-3xl rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <StatusMessage error={error} />
        <form action={updateEmployee} className="mt-6 space-y-5">
          <input type="hidden" name="employeeId" value={employee.id} />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Full name</label>
              <input id="name" name="name" defaultValue={employee.user.name} required className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input id="email" name="email" type="email" defaultValue={employee.user.email} required className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Phone</label>
              <input id="phone" name="phone" defaultValue={employee.phone ?? ""} required className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <select id="status" name="status" defaultValue={employee.status} className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">New password</label>
            <input id="password" name="password" type="password" placeholder="Leave blank to keep current password" className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
          </div>
          <SubmitButton label="Save changes" pendingLabel="Saving changes..." />
        </form>
      </section>
    </div>
  );
}
