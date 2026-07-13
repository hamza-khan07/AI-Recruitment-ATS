"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, getData } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, Calendar, Briefcase, MapPin, DollarSign, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function JobDetails() {
  const params = useParams();
  const id = params?.id;
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchJob = async () => {
      try {
        const res = await api.get(`/api/v1/jobs/${id}`);
        setJob(getData(res));
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!job) return <div className="rounded-md border p-8 text-center">Job not found.</div>;

  const mockStats = {
    shortlisted: 0,
    interviews: 0,
    offers: 0,
    hired: 0,
    rejected: 0,
  };

  const formatSalary = (min?: number, max?: number) => {
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return "Not specified";
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold text-zinc-900">{job.title}</h1>
            <Badge variant={job.status === 'PUBLISHED' ? 'default' : 'secondary'} className={job.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}>
              {job.status}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
            <div className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.department || "No Department"}</div>
            <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location || "Remote"}</div>
            <div className="flex items-center gap-1"><Clock className="h-4 w-4" /> {job.employmentType || "Full-time"}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/hr-management/jobs/${job.id}/edit`}>
            <Button variant="outline">Edit Job</Button>
          </Link>
          <Button variant="secondary">View Candidates</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="col-span-2 space-y-8 rounded-lg border bg-white p-6 shadow-sm">
          {/* Main Details */}
          <section>
            <h3 className="mb-4 text-lg font-semibold border-b pb-2">Job Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-zinc-500 mb-1 flex items-center gap-1"><DollarSign className="h-4 w-4" /> Salary Range</p>
                <p className="font-medium text-zinc-900">{formatSalary(job.salaryMin, job.salaryMax)}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1 flex items-center gap-1"><Briefcase className="h-4 w-4" /> Experience Required</p>
                <p className="font-medium text-zinc-900">{job.experience || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1 flex items-center gap-1"><Calendar className="h-4 w-4" /> Created Date</p>
                <p className="font-medium text-zinc-900">{new Date(job.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1 flex items-center gap-1"><Calendar className="h-4 w-4" /> Closing Date</p>
                <p className="font-medium text-zinc-900">{job.deadline ? new Date(job.deadline).toLocaleDateString() : "No deadline"}</p>
              </div>
            </div>
          </section>

          {/* Description */}
          <section>
            <h3 className="mb-3 text-lg font-semibold border-b pb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-zinc-400" /> Job Description
            </h3>
            <div className="prose max-w-none text-zinc-700 whitespace-pre-wrap">
              {job.description || "No description provided."}
            </div>
          </section>

          {/* Responsibilities */}
          {job.responsibilities && (
            <section>
              <h3 className="mb-3 text-lg font-semibold border-b pb-2">Responsibilities</h3>
              <div className="prose max-w-none text-zinc-700 whitespace-pre-wrap">{job.responsibilities}</div>
            </section>
          )}

          {/* Requirements & Skills */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {job.requirements && (
              <div>
                <h3 className="mb-3 text-lg font-semibold border-b pb-2">Requirements</h3>
                <div className="prose max-w-none text-zinc-700 whitespace-pre-wrap">{job.requirements}</div>
              </div>
            )}
            
            {job.skills && (
              <div>
                <h3 className="mb-3 text-lg font-semibold border-b pb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.split(',').map((skill: string, i: number) => (
                    <Badge key={i} variant="secondary" className="font-normal">{skill.trim()}</Badge>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Benefits */}
          {job.benefits && (
            <section>
              <h3 className="mb-3 text-lg font-semibold border-b pb-2">Benefits</h3>
              <div className="prose max-w-none text-zinc-700 whitespace-pre-wrap">{job.benefits}</div>
            </section>
          )}
        </div>

        {/* Right Sidebar - Quick Statistics */}
        <aside className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold border-b pb-2">Quick Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-md bg-zinc-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase">Applications</p>
                    <p className="text-xl font-bold">{job.applications || 0}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border p-3">
                  <p className="text-xs text-zinc-500 mb-1">Shortlisted</p>
                  <p className="text-lg font-semibold text-zinc-900">{mockStats.shortlisted}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-zinc-500 mb-1">Interviews</p>
                  <p className="text-lg font-semibold text-zinc-900">{mockStats.interviews}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-zinc-500 mb-1">Offers</p>
                  <p className="text-lg font-semibold text-zinc-900">{mockStats.offers}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-zinc-500 mb-1">Hired</p>
                  <p className="text-lg font-semibold text-green-600">{mockStats.hired} / {job.openPositions || 1}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-3 mt-4">
                <span className="text-sm text-zinc-500">Rejected</span>
                <span className="text-sm font-medium text-red-600">{mockStats.rejected}</span>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold border-b pb-2">Information</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Open Positions</span>
                <span className="font-medium">{job.openPositions || 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Work Mode</span>
                <span className="font-medium">{job.workMode || "On-site"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Recruiter ID</span>
                <span className="font-medium text-xs font-mono">{job.createdBy.substring(0,8)}...</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
