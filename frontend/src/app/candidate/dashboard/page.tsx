"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  TrendingUp,
  MapPin,
  ArrowRight,
  Zap,
  Globe,
  Building2,
} from "lucide-react";
import { SearchBar } from "@/components/candidate/search-bar";
import { JobCard } from "@/components/candidate/job-card";
import {
  MOCK_JOBS,
  MOCK_COMPANIES,
  INITIAL_SAVED_JOB_IDS,
} from "@/lib/candidate-mock-data";

// Quick filter chips for the dashboard
const QUICK_FILTERS = [
  { label: "Remote", icon: Globe, filter: "REMOTE" },
  { label: "Full Time", icon: Briefcase, filter: "FULL_TIME" },
  { label: "Hybrid", icon: Building2, filter: "HYBRID" },
  { label: "Trending", icon: TrendingUp, filter: "trending" },
];

// Stats bar
const PORTAL_STATS = [
  { label: "Active Jobs", value: "12+" },
  { label: "Companies Hiring", value: "6" },
  { label: "Remote Roles", value: "3" },
  { label: "New This Week", value: "5" },
];

export default function CandidateDashboardPage() {
  const [savedIds, setSavedIds] = useState<Set<string>>(
    new Set(INITIAL_SAVED_JOB_IDS)
  );
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const toggleSave = (jobId: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(jobId) ? next.delete(jobId) : next.add(jobId);
      return next;
    });
  };

  // Featured jobs (hero section)
  const featuredJobs = MOCK_JOBS.filter((j) => j.featured);

  // Recent jobs: apply quick filter
  const recentJobs = MOCK_JOBS.filter((j) => {
    if (!activeFilter) return true;
    if (activeFilter === "trending") return j.featured;
    return j.type === activeFilter;
  }).slice(0, 6);

  return (
    <div className="space-y-10">
      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 py-12 text-white sm:px-10 sm:py-16">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-24 -left-8 h-80 w-80 rounded-full bg-white/5" />
          <div className="absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-blue-500/20" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5 text-yellow-300" />
            AI-Powered Job Matching
          </div>

          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Find Your{" "}
            <span className="relative">
              <span className="relative z-10 text-yellow-300">Dream Job</span>
              <span className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-yellow-300/40" />
            </span>{" "}
            Today
          </h1>

          <p className="mt-4 text-base text-blue-100 sm:text-lg">
            Browse opportunities from top Pakistani tech companies. Apply in minutes.
          </p>

          {/* Search Bar */}
          <div className="mt-8">
            <SearchBar variant="hero" />
          </div>

          {/* Quick Filters */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {QUICK_FILTERS.map((qf) => {
              const Icon = qf.icon;
              const active = activeFilter === qf.filter;
              return (
                <button
                  key={qf.filter}
                  onClick={() => setActiveFilter(active ? null : qf.filter)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? "border-yellow-300 bg-yellow-300 text-zinc-900"
                      : "border-white/30 bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {qf.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats row */}
        <div className="relative mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 mx-auto max-w-2xl">
          {PORTAL_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center backdrop-blur-sm"
            >
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-blue-200">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Jobs ─────────────────────────────────────────────── */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Featured Opportunities</h2>
            <p className="mt-0.5 text-sm text-zinc-500">Hand-picked roles from top employers</p>
          </div>
          <Link
            href="/candidate/jobs"
            className="flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {featuredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              saved={savedIds.has(job.id)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      </section>

      {/* ── Recent Jobs ───────────────────────────────────────────────── */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Recent Jobs</h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              {activeFilter
                ? `Filtered by: ${QUICK_FILTERS.find((f) => f.filter === activeFilter)?.label}`
                : "Latest job postings across all categories"}
            </p>
          </div>
          <Link
            href="/candidate/jobs"
            className="flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
          >
            See all jobs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentJobs.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {recentJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                saved={savedIds.has(job.id)}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white px-8 py-16 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-zinc-300" />
            <p className="mt-3 text-sm font-medium text-zinc-500">
              No jobs found for this filter
            </p>
            <button
              onClick={() => setActiveFilter(null)}
              className="mt-3 text-sm font-medium text-blue-600 hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}
      </section>

      {/* ── Hiring Companies ──────────────────────────────────────────── */}
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Top Hiring Companies</h2>
            <p className="mt-0.5 text-sm text-zinc-500">Explore companies actively recruiting</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {MOCK_COMPANIES.map((company) => (
            <Link
              key={company.id}
              href={`/candidate/jobs?company=${encodeURIComponent(company.name)}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-zinc-100 p-4 text-center transition hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-sm font-bold text-blue-700 ring-1 ring-blue-100 transition group-hover:ring-blue-300">
                {company.logo}
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-800 line-clamp-1">{company.name}</p>
                <p className="mt-0.5 text-[10px] text-zinc-400">{company.industry}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                <MapPin className="h-2.5 w-2.5" />
                {company.location.split(",")[0]}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section className="rounded-3xl bg-gradient-to-r from-zinc-900 to-zinc-800 px-8 py-10 text-center">
        <h2 className="text-2xl font-bold text-white">
          Ready to take the next step?
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Complete your profile and get noticed by top employers in Pakistan.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/candidate/profile"
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Complete Profile
          </Link>
          <Link
            href="/candidate/jobs"
            className="rounded-xl border border-white/20 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Browse All Jobs
          </Link>
        </div>
      </section>
    </div>
  );
}
