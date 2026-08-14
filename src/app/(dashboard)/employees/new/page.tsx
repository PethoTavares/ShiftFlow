import { PageHeader } from "@/components/ui/page-header";
import { StatusMessage } from "@/components/ui/status-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { createEmployee } from "@/features/employees/actions";
import { requireManager } from "@/lib/auth";
import { getQueryStringMessage } from "@/lib/utils";

type NewEmployeePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function NewEmployeePage({ searchParams }: NewEmployeePageProps) {
  await requireManager();
  const resolvedSearchParams = await searchParams;
  const error = getQueryStringMessage(resolvedSearchParams.error);

  return (
    <div className="space-y-8">
      <PageHeader title="Create employee" description="Add an employee profile and create their sign-in credentials." />
      <section className="max-w-3xl rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
        <StatusMessage error={error} />
        <form action={createEmployee} className="mt-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Full name</label>
              <input id="name" name="name" required className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input id="email" name="email" type="email" required className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Phone</label>
              <input id="phone" name="phone" required className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <select id="status" name="status" defaultValue="ACTIVE" className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Temporary password</label>
            <input id="password" name="password" type="password" required className="focus-ring w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5" />
          </div>
          <SubmitButton label="Create employee" pendingLabel="Creating employee..." />
        </form>
      </section>
    </div>
  );
}
