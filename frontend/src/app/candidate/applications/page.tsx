"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Briefcase, MapPin, Clock, ChevronRight, Filter, Loader2, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/candidate/status-badge";
import { timeAgo } from "@/lib/candidate-mock-data";
import type { ApplicationStatus } from "@/types/candidate";
import { cn } from "@/lib/utils";
import api, { getData } from "@/lib/api";

const STATUS_FILTERS: { value: ApplicationStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "APPLIED", label: "Applied" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEWED", label: "Interviewed" },
  { value: "OFFERED", label: "Offered" },
  { value: "REJECTED", label: "Rejected" },
];

// Timeline steps for visual progress
const TIMELINE_STEPS: ApplicationStatus[] = [
  "APPLIED",
  "IN_REVIEW",
  "SHORTLISTED",
  "INTERVIEWED",
  "OFFERED",
];

function getStepIndex(status: ApplicationStatus) {
  // If status is not in timeline steps, it returns -1 (which hides progress)
  return TIMELINE_STEPS.indexOf(status);
}

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  INTERNSHIP: "Internship",
};

export default function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">("ALL");
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await api.get("/candidates/applications").then(getData<any[]>);
        setApplications(data || []);
      } catch (err: any) {
        console.error("Failed to load applications:", err);
        setError(err.response?.data?.message || "Failed to load applications.");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const filtered = applications.filter(
    (app) => statusFilter === "ALL" || app.status === statusFilter
  );

  const stats = {
    total: applications.length,
    active: applications.filter((a) =>
      ["APPLIED", "IN_REVIEW", "SHORTLISTED", "INTERVIEWED"].includes(a.status)
    ).length,
    offered: applications.filter((a) => a.status === "OFFERED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center text-red-600">
        <AlertCircle className="mx-auto mb-2 h-8 w-8 opacity-80" />
        <p className="font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm font-semibold hover:underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">My Applications</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Track and manage all your job applications in one place
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Applied", value: stats.total, color: "bg-blue-50 text-blue-700 border-blue-100" },
          { label: "Active", value: stats.active, color: "bg-amber-50 text-amber-700 border-amber-100" },
          { label: "Offered", value: stats.offered, color: "bg-green-50 text-green-700 border-green-100" },
          { label: "Not Selected", value: stats.rejected, color: "bg-red-50 text-red-600 border-red-100" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "rounded-2xl border p-4 text-center",
              stat.color
            )}
          >
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs font-medium opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        <Filter className="h-4 w-4 shrink-0 text-zinc-400 mr-1" />
        {STATUS_FILTERS.map((sf) => (
          <button
            key={sf.value}
            onClick={() => setStatusFilter(sf.value)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition",
              statusFilter === sf.value
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            )}
          >
            {sf.label}
          </button>
        ))}
      </div>

      {/* Application Cards */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((app) => {
            const stepIdx = getStepIndex(app.status);
            const isNegative = app.status === "REJECTED" || app.status === "WITHDRAWN";

            return (
              <div
                key={app.id}
                className="group rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md hover:shadow-blue-50"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Job info */}
                    <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
                      {app.job?.company?.logo ? (
                        <img src={app.job.company.logo} alt="logo" className="h-full w-full object-cover rounded-xl" />
                      ) : (
                        app.job?.company?.name?.charAt(0) || "C"
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/candidate/jobs/${app.job?.id}`}
                        className="text-base font-bold text-zinc-900 transition group-hover:text-blue-700"
                      >
                        {app.job?.title}
                      </Link>
                      <p className="mt-0.5 text-sm text-zinc-500">{app.job?.company?.name}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {app.job?.location || "Remote"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {app.job?.employmentType ? (JOB_TYPE_LABELS[app.job.employmentType] ?? app.job.employmentType) : "Full Time"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Applied {timeAgo(app.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status + action */}
                  <div className="flex items-center gap-3 sm:shrink-0 sm:flex-col sm:items-end">
                    <StatusBadge status={app.status} />
                    <Link
                      href={`/candidate/jobs/${app.job?.id}`}
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                    >
                      View Job <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Progress Timeline (only for non-negative statuses) */}
                {!isNegative && (
                  <div className="mt-5 border-t border-zinc-100 pt-4">
                    <div className="flex items-center justify-between gap-0">
                      {TIMELINE_STEPS.map((step, idx) => {
                        const isCompleted = idx <= stepIdx;
                        const isCurrent = idx === stepIdx;
                        const isLast = idx === TIMELINE_STEPS.length - 1;

                        return (
                          <div key={step} className="flex flex-1 items-center">
                            {/* Step dot */}
                            <div className="flex flex-col items-center gap-1">
                              <div
                                className={cn(
                                  "h-2.5 w-2.5 rounded-full border-2 transition-all",
                                  isCompleted
                                    ? "border-blue-600 bg-blue-600"
                                    : "border-zinc-300 bg-white",
                                  isCurrent && "ring-2 ring-blue-200"
                                )}
                              />
                              <span className="hidden text-[9px] font-medium text-zinc-400 sm:block capitalize">
                                {step.replace("_", " ").toLowerCase()}
                              </span>
                            </div>
                            {/* Connector line */}
                            {!isLast && (
                              <div
                                className={cn(
                                  "mx-0.5 h-0.5 flex-1",
                                  idx < stepIdx ? "bg-blue-600" : "bg-zinc-200"
                                )}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white py-20 text-center">
          <FileText className="h-12 w-12 text-zinc-200" />
          <div>
            <p className="font-semibold text-zinc-700">No applications yet</p>
            <p className="mt-1 text-sm text-zinc-400">
              {statusFilter === "ALL"
                ? "Start applying to jobs to track them here."
                : `No applications with status "${statusFilter}".`}
            </p>
          </div>
          <Link
            href="/candidate/jobs"
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Browse Jobs
          </Link>
        </div>
      )}
    </div>
  );
}
