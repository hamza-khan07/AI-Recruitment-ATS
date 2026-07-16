"use client";

import Link from "next/link";
import { MapPin, Clock, Briefcase, Bookmark, BookmarkCheck, DollarSign } from "lucide-react";
import type { Job } from "@/types/candidate";
import { formatSalary, timeAgo } from "@/lib/candidate-mock-data";
import { cn } from "@/lib/utils";

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  ENTRY: "Entry Level",
  MID: "Mid Level",
  SENIOR: "Senior",
  LEAD: "Lead",
  EXECUTIVE: "Executive",
};

const TYPE_COLORS: Record<string, string> = {
  FULL_TIME: "bg-blue-50 text-blue-700",
  PART_TIME: "bg-amber-50 text-amber-700",
  CONTRACT: "bg-orange-50 text-orange-700",
  INTERNSHIP: "bg-green-50 text-green-700",
  REMOTE: "bg-purple-50 text-purple-700",
  HYBRID: "bg-sky-50 text-sky-700",
};

interface JobCardProps {
  job: Job;
  saved: boolean;
  onToggleSave: (jobId: string) => void;
  compact?: boolean;
}

export function JobCard({ job, saved, onToggleSave, compact = false }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);
  const posted = timeAgo(job.postedAt);

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border border-zinc-200 bg-white transition-all duration-200",
        "hover:border-blue-200 hover:shadow-md hover:shadow-blue-50",
        compact ? "p-4" : "p-5"
      )}
    >
      {/* Featured badge */}
      {job.featured && (
        <span className="absolute right-4 top-4 rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white">
          Featured
        </span>
      )}

      {/* Header: Company logo + info */}
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 overflow-hidden shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
          {job.company.logo && job.company.logo.length > 5 ? (
            <img src={job.company.logo} alt={job.company.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs">{job.company.logo || job.company.name.substring(0, 2).toUpperCase()}</span>
          )}
        </div>

        <div className="min-w-0 flex-1 pr-8">
          <Link
            href={`/candidate/jobs/${job.id}`}
            className="block truncate text-sm font-medium text-zinc-500 transition hover:text-blue-600"
          >
            {job.company.name}
          </Link>
          <Link
            href={`/candidate/jobs/${job.id}`}
            className="mt-0.5 block text-base font-semibold text-zinc-900 transition group-hover:text-blue-700 line-clamp-1"
          >
            {job.title}
          </Link>
        </div>
      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
            TYPE_COLORS[job.type] ?? "bg-zinc-100 text-zinc-600"
          )}
        >
          <Briefcase className="h-3 w-3" />
          {JOB_TYPE_LABELS[job.type] ?? job.type}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
          {EXPERIENCE_LABELS[job.experienceLevel] ?? job.experienceLevel}
        </span>
      </div>

      {/* Details */}
      {!compact && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 shrink-0" />
            {salary}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 shrink-0" />
            {posted}
          </span>
        </div>
      )}

      {/* Skills */}
      {!compact && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600 ring-1 ring-zinc-200"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="rounded-md bg-zinc-50 px-2 py-0.5 text-xs text-zinc-400 ring-1 ring-zinc-200">
              +{job.skills.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-zinc-100 pt-3">
        <span className="text-xs text-zinc-400">
          {job.openings} opening{job.openings > 1 ? "s" : ""}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleSave(job.id)}
            aria-label={saved ? "Remove from saved" : "Save job"}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150",
              saved
                ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                : "text-zinc-400 hover:text-blue-600 hover:bg-blue-50"
            )}
          >
            {saved ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>

          <Link
            href={`/candidate/jobs/${job.id}`}
            className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 active:scale-95"
          >
            View Job
          </Link>
        </div>
      </div>
    </div>
  );
}
