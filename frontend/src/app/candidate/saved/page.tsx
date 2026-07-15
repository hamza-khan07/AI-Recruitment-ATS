"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Trash2, Briefcase } from "lucide-react";
import { JobCard } from "@/components/candidate/job-card";
import { MOCK_JOBS, INITIAL_SAVED_JOB_IDS } from "@/lib/candidate-mock-data";

export default function SavedJobsPage() {
  const [savedIds, setSavedIds] = useState<Set<string>>(
    new Set(INITIAL_SAVED_JOB_IDS)
  );

  const toggleSave = (jobId: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(jobId) ? next.delete(jobId) : next.add(jobId);
      return next;
    });
  };

  const clearAll = () => setSavedIds(new Set());

  const savedJobs = MOCK_JOBS.filter((j) => savedIds.has(j.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Saved Jobs</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {savedJobs.length} job{savedJobs.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        {savedJobs.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear All
          </button>
        )}
      </div>

      {savedJobs.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {savedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              saved={savedIds.has(job.id)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <Bookmark className="h-8 w-8 text-blue-300" />
          </div>
          <div>
            <p className="font-semibold text-zinc-700">No saved jobs yet</p>
            <p className="mt-1 text-sm text-zinc-400">
              Click the bookmark icon on any job to save it here.
            </p>
          </div>
          <Link
            href="/candidate/jobs"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Briefcase className="h-4 w-4" />
            Browse Jobs
          </Link>
        </div>
      )}
    </div>
  );
}
