"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import JobForm from "@/components/hr/job-form";
import { api, getData } from "@/lib/api";

export default function EditJobPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const fetchJob = async () => {
      const res = await api.get(`/api/v1/jobs/${id}`);
      setJob(getData(res));
    };

    fetchJob();
  }, [id]);

  const handleSubmit = async (data: any) => {
    await api.put(`/api/v1/jobs/${id}`, data);
    router.push(`/hr-management/jobs/${id}`);
  };

  if (!job) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Edit Job</h1>
      <p className="text-sm text-zinc-500">Edit job posting.</p>

      <div className="mt-6">
        <JobForm initial={job} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
