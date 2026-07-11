import { PageContainer } from "@/components/hr/hr-shell";

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  "company-profile": "Company Profile",
  "career-page": "Career Page",
  jobs: "Jobs",
  applications: "Applications",
  candidates: "Candidates",
  "candidate-pipeline": "Candidate Pipeline",
  "interview-scheduling": "Interview Scheduling",
  "ai-job-description": "AI Job Description",
  "email-templates": "Email Templates",
};

export default function HrManagementRoutePage({ params }: { params: { slug?: string[] } }) {
  const slug = params.slug?.[0] ?? "dashboard";
  const title = pageTitles[slug] ?? "Dashboard";

  return (
    <PageContainer title={title}>
      <div className="rounded-[1.5rem] border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Placeholder content for the HR portal route.
        </p>
      </div>
    </PageContainer>
  );
}
