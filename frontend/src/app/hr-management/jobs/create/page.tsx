"use client";

import { useRouter } from "next/navigation";
import JobForm from "@/components/hr/job-form";
import { api } from "@/lib/api";

export default function CreateJobPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    await api.post(`/api/v1/jobs`, data);
    router.push("/hr-management/jobs");
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Create Job</h1>
      <p className="text-sm text-zinc-500">Create a new job posting.</p>

      <div className="mt-6">
        <JobForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
