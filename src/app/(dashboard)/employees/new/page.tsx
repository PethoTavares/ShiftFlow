import { PageHeader } from "@/components/ui/page-header";
import { StatusMessage } from "@/components/ui/status-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { createEmployee } from "@/features/employees/actions";
import { requireManager } from "@/lib/auth";
import { getQueryStringMessage } from "@/lib/utils";
import Link from "next/link";

type NewEmployeePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function NewEmployeePage({ searchParams }: NewEmployeePageProps) {
  await requireManager();
  const resolvedSearchParams = await searchParams;
  const error = getQueryStringMessage(resolvedSearchParams.error);

  return (
    <div className="app-shell">
      <PageHeader
        title="Create employee"
        description="Add an employee profile, assign an initial account status, and generate sign-in credentials."
        action={<Link href="/employees" className={buttonVariants({ variant: "secondary" })}>Back to employees</Link>}
      />
      <section className="app-panel-section max-w-3xl">
        <StatusMessage error={error} />
        <form action={createEmployee} className="mt-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="app-label">Full name</label>
              <input id="name" name="name" required className="app-input" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="app-label">Email</label>
              <input id="email" name="email" type="email" required className="app-input" />
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="phone" className="app-label">Phone</label>
              <input id="phone" name="phone" required className="app-input" />
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="app-label">Status</label>
              <select id="status" name="status" defaultValue="ACTIVE" className="app-select">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="app-label">Temporary password</label>
            <input id="password" name="password" type="password" required className="app-input" />
            <p className="text-sm text-[var(--color-muted-foreground)]">
              The employee can use this password immediately and update it later if that workflow is added in the future.
            </p>
          </div>
          <SubmitButton label="Create employee" pendingLabel="Creating employee..." />
        </form>
      </section>
    </div>
  );
}
