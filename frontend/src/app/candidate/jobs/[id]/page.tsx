"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Users,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Share2,
  ExternalLink,
  Building2,
} from "lucide-react";
import { ApplyModal } from "@/components/candidate/apply-modal";
import {
  INITIAL_SAVED_JOB_IDS,
  formatSalary,
  timeAgo,
} from "@/lib/candidate-mock-data";
import { api } from "@/lib/api";
import type { Job } from "@/types/candidate";

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

const EXP_LABELS: Record<string, string> = {
  ENTRY: "Entry Level",
  MID: "Mid Level",
  SENIOR: "Senior",
  LEAD: "Lead",
  EXECUTIVE: "Executive",
};

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params?.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/v1/jobs/published/${jobId}`)
      .then(res => {
        const j = res.data?.data;
        if (!j) return;
        const transformed: Job = {
          id: j.id,
          title: j.title,
          company: {
            ...j.company,
            location: j.company?.address || "Remote",
            size: j.company?.size || "Not Specified",
            website: j.company?.websiteUrl || j.company?.website || "",
          },
          location: j.location || j.company?.address || "Remote",
          type: j.workMode === "Remote" ? "REMOTE" : (j.employmentType === "Full-time" ? "FULL_TIME" : "HYBRID"),
          workMode: j.workMode || "",
          employmentType: j.employmentType || "",
          experienceLevel: j.experience?.toUpperCase().includes("SENIOR") ? "SENIOR" : j.experience?.toUpperCase().includes("MID") ? "MID" : "ENTRY",
          salaryMin: j.salaryMin || 0,
          salaryMax: j.salaryMax || 0,
          salaryCurrency: "PKR",
          description: j.description || "",
          responsibilities: j.responsibilities ? j.responsibilities.split("\n") : [],
          requirements: j.requirements ? j.requirements.split("\n") : [],
          benefits: j.benefits ? j.benefits.split("\n") : [],
          skills: j.skills ? j.skills.split(",") : [],
          status: "PUBLISHED",
          openings: j.openPositions || 1,
          postedAt: j.createdAt,
          deadline: j.deadline || "",
          featured: false
        };
        setJob(transformed);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [jobId]);

  const [applyOpen, setApplyOpen] = useState(false);
  const [saved, setSaved] = useState(INITIAL_SAVED_JOB_IDS.includes(jobId));

  if (isLoading) {
    return <div className="mx-auto max-w-5xl py-20 text-center text-zinc-500">Loading job details...</div>;
  }

  if (!job) {
    notFound();
  }

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);
  const posted = timeAgo(job.postedAt);

  // Related jobs
  const relatedJobs: Job[] = [];

  return (
    <>
      <div className="mx-auto max-w-5xl">
        {/* Back button */}
        <Link
          href="/candidate/jobs"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* ── Main Content ── */}
          <div className="space-y-6">
            {/* Job Header Card */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 overflow-hidden shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-lg font-bold text-blue-700 ring-1 ring-blue-100">
                    {job.company.logo && job.company.logo.length > 5 ? (
                      <img src={job.company.logo} alt={job.company.name} className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-8 w-8 text-blue-500" />
                    )}
                  </div>

                  <div>
                    {job.featured && (
                      <span className="mb-1.5 inline-block rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                        Featured
                      </span>
                    )}
                    <h1 className="text-2xl font-bold text-zinc-900">{job.title}</h1>
                    <p className="mt-1 text-base font-medium text-zinc-500">
                      {job.company.name}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:shrink-0">
                  <button
                    onClick={() => setSaved((prev) => !prev)}
                    aria-label={saved ? "Unsave job" : "Save job"}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${saved
                        ? "border-blue-200 bg-blue-50 text-blue-600"
                        : "border-zinc-200 text-zinc-400 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                      }`}
                  >
                    {saved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                  </button>
                  <button
                    aria-label="Share job"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setApplyOpen(true)}
                    className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.98]"
                  >
                    Apply Now
                  </button>
                </div>
              </div>

              {/* Job Meta */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="flex flex-col gap-0.5 rounded-xl bg-zinc-50 px-3 py-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Location</span>
                  <span className="flex items-center gap-1 text-sm font-medium text-zinc-700">
                    <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    {job.location}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 rounded-xl bg-zinc-50 px-3 py-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Type</span>
                  <span className="flex items-center gap-1 text-sm font-medium text-zinc-700">
                    <Briefcase className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    {JOB_TYPE_LABELS[job.type] ?? job.type}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 rounded-xl bg-zinc-50 px-3 py-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Salary</span>
                  <span className="flex items-center gap-1 text-sm font-medium text-zinc-700">
                    <DollarSign className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    {salary}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 rounded-xl bg-zinc-50 px-3 py-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Posted</span>
                  <span className="flex items-center gap-1 text-sm font-medium text-zinc-700">
                    <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    {posted}
                  </span>
                </div>
              </div>

              {/* Skills */}
              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="mb-3 text-lg font-bold text-zinc-900">About This Role</h2>
              <p className="text-sm leading-relaxed text-zinc-600">{job.description}</p>
            </div>

            {/* Responsibilities */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-zinc-900">Responsibilities</h2>
              <ul className="space-y-2.5">
                {job.responsibilities.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-zinc-900">Requirements</h2>
              <ul className="space-y-2.5">
                {job.requirements.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-600">
                    <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-zinc-900">Benefits & Perks</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {job.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                    <span className="text-sm text-green-800">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Apply CTA */}
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center text-white">
              <h3 className="text-lg font-bold">Interested in this role?</h3>
              <p className="mt-1 text-sm text-blue-100">
                Apply now and let your skills speak for themselves.
              </p>
              <button
                onClick={() => setApplyOpen(true)}
                className="mt-4 rounded-xl bg-white px-8 py-2.5 text-sm font-bold text-blue-600 transition hover:bg-blue-50 active:scale-[0.98]"
              >
                Apply Now →
              </button>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">
            {/* Company Info */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-zinc-900">About the Company</h3>
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-semibold text-zinc-900">{job.company.name}</p>
                  <p className="text-xs text-zinc-400">{job.company.industry}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5 text-sm text-zinc-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-zinc-400" />
                  {job.company.location}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 shrink-0 text-zinc-400" />
                  {job.company.size} employees
                </div>
              </div>

              <p className="mt-3 text-xs text-zinc-500 leading-relaxed">{job.company.description}</p>

              {job.company.website && (
                <a
                  href={job.company.website.startsWith("http") ? job.company.website : `https://${job.company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 py-2 text-xs font-medium text-zinc-600 transition hover:border-blue-200 hover:text-blue-600"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Visit Website
                </a>
              )}
            </div>

            {/* Job Summary */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-zinc-900">Job Summary</h3>
              <dl className="space-y-3 text-sm">
                {[
                  { label: "Experience", value: EXP_LABELS[job.experienceLevel] ?? job.experienceLevel },
                  { label: "Openings", value: `${job.openings} position${job.openings > 1 ? "s" : ""}` },
                  {
                    label: "Apply Before",
                    value: new Date(job.deadline).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                  },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <dt className="text-zinc-400">{item.label}</dt>
                    <dd className="font-medium text-zinc-800">{item.value}</dd>
                  </div>
                ))}
              </dl>

              <button
                onClick={() => setApplyOpen(true)}
                className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
              >
                Apply Now
              </button>
            </div>

            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <h3 className="mb-4 text-sm font-bold text-zinc-900">Similar Jobs</h3>
                <div className="space-y-3">
                  {relatedJobs.map((rj) => (
                    <Link
                      key={rj.id}
                      href={`/candidate/jobs/${rj.id}`}
                      className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-zinc-50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                        {rj.company.logo}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-zinc-800">{rj.title}</p>
                        <p className="text-[11px] text-zinc-400">{rj.company.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {applyOpen && <ApplyModal job={job} onClose={() => setApplyOpen(false)} />}
    </>
  );
}
