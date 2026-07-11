import { PageContainer } from "@/components/hr/hr-shell";

export default function HrManagementHomePage() {
  return (
    <PageContainer title="Dashboard">
      <div className="rounded-[1.5rem] border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">Welcome to the HR Management Dashboard</h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This placeholder page is ready for the future HR experience.
        </p>
      </div>
    </PageContainer>
  );
}
