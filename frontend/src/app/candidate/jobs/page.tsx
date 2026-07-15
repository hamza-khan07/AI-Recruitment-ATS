"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Briefcase, FilterX } from "lucide-react";
import { JobCard } from "@/components/candidate/job-card";
import { SearchBar } from "@/components/candidate/search-bar";
import { MOCK_JOBS, INITIAL_SAVED_JOB_IDS } from "@/lib/candidate-mock-data";
import type { JobType, ExperienceLevel } from "@/types/candidate";
import { cn } from "@/lib/utils";

const JOB_TYPES: { value: JobType | ""; label: string }[] = [
  { value: "", label: "All Types" },
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "INTERNSHIP", label: "Internship" },
];

const EXPERIENCE_LEVELS: { value: ExperienceLevel | ""; label: string }[] = [
  { value: "", label: "All Levels" },
  { value: "ENTRY", label: "Entry Level" },
  { value: "MID", label: "Mid Level" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Lead" },
  { value: "EXECUTIVE", label: "Executive" },
];

const LOCATIONS = ["All Locations", "Lahore, Pakistan", "Karachi, Pakistan", "Remote"];

const SALARY_RANGES = [
  { label: "Any Salary", min: 0, max: Infinity },
  { label: "Up to 200K PKR", min: 0, max: 200000 },
  { label: "200K – 350K PKR", min: 200000, max: 350000 },
  { label: "350K+ PKR", min: 350000, max: Infinity },
];

export default function JobsPage() {
  const searchParams = useSearchParams();

  const [savedIds, setSavedIds] = useState<Set<string>>(
    new Set(INITIAL_SAVED_JOB_IDS)
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter state
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [locationFilter, setLocationFilter] = useState(
    searchParams.get("location") ?? ""
  );
  const [typeFilter, setTypeFilter] = useState<JobType | "">("");
  const [expFilter, setExpFilter] = useState<ExperienceLevel | "">("");
  const [salaryIdx, setSalaryIdx] = useState(0);

  // Sync URL params
  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
    setLocationFilter(searchParams.get("location") ?? "");
  }, [searchParams]);

  const toggleSave = (jobId: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(jobId) ? next.delete(jobId) : next.add(jobId);
      return next;
    });
  };

  const hasFilters =
    search || locationFilter || typeFilter || expFilter || salaryIdx !== 0;

  const resetFilters = () => {
    setSearch("");
    setLocationFilter("");
    setTypeFilter("");
    setExpFilter("");
    setSalaryIdx(0);
  };

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    const salaryRange = SALARY_RANGES[salaryIdx];
    return MOCK_JOBS.filter((job) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        job.title.toLowerCase().includes(searchLower) ||
        job.company.name.toLowerCase().includes(searchLower) ||
        job.skills.some((s) => s.toLowerCase().includes(searchLower));

      const matchesLocation =
        !locationFilter ||
        locationFilter === "All Locations" ||
        job.location.toLowerCase().includes(locationFilter.toLowerCase());

      const matchesType = !typeFilter || job.type === typeFilter;
      const matchesExp = !expFilter || job.experienceLevel === expFilter;
      const matchesSalary =
        job.salaryMin >= salaryRange.min && job.salaryMax <= (salaryRange.max === Infinity ? Number.MAX_SAFE_INTEGER : salaryRange.max);

      return matchesSearch && matchesLocation && matchesType && matchesExp && matchesSalary;
    });
  }, [search, locationFilter, typeFilter, expFilter, salaryIdx]);

  // Filter sidebar content (reused for both desktop + mobile)
  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Job Type */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
          Job Type
        </h3>
        <div className="space-y-1.5">
          {JOB_TYPES.map((jt) => (
            <button
              key={jt.value}
              onClick={() => setTypeFilter(jt.value)}
              className={cn(
                "w-full rounded-xl px-3 py-2 text-left text-sm transition",
                typeFilter === jt.value
                  ? "bg-blue-50 font-semibold text-blue-700"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              {jt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
          Experience Level
        </h3>
        <div className="space-y-1.5">
          {EXPERIENCE_LEVELS.map((el) => (
            <button
              key={el.value}
              onClick={() => setExpFilter(el.value)}
              className={cn(
                "w-full rounded-xl px-3 py-2 text-left text-sm transition",
                expFilter === el.value
                  ? "bg-blue-50 font-semibold text-blue-700"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              {el.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
          Location
        </h3>
        <div className="space-y-1.5">
          {LOCATIONS.map((loc) => (
            <button
              key={loc}
              onClick={() => setLocationFilter(loc === "All Locations" ? "" : loc)}
              className={cn(
                "w-full rounded-xl px-3 py-2 text-left text-sm transition",
                (loc === "All Locations" && !locationFilter) || locationFilter === loc
                  ? "bg-blue-50 font-semibold text-blue-700"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Salary */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
          Salary Range
        </h3>
        <div className="space-y-1.5">
          {SALARY_RANGES.map((sr, idx) => (
            <button
              key={sr.label}
              onClick={() => setSalaryIdx(idx)}
              className={cn(
                "w-full rounded-xl px-3 py-2 text-left text-sm transition",
                salaryIdx === idx
                  ? "bg-blue-50 font-semibold text-blue-700"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              {sr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      {hasFilters && (
        <button
          onClick={resetFilters}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 py-2 text-sm font-medium text-zinc-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <FilterX className="h-4 w-4" />
          Reset All Filters
        </button>
      )}
    </div>
  );

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Browse Jobs</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Discover opportunities from top companies across Pakistan
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <SearchBar
              variant="compact"
              initialQuery={search}
              initialLocation={locationFilter}
            />
          </div>
          {/* Mobile filters toggle */}
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasFilters && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                !
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* ── Desktop Filter Sidebar ── */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-900">Filters</h2>
              {hasFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* ── Job Listings ── */}
        <div className="min-w-0 flex-1">
          {/* Result count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              <span className="font-semibold text-zinc-900">{filteredJobs.length}</span>{" "}
              {filteredJobs.length === 1 ? "job" : "jobs"} found
            </p>
            {hasFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition hover:text-red-500"
              >
                <X className="h-3 w-3" />
                Clear filters
              </button>
            )}
          </div>

          {filteredJobs.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  saved={savedIds.has(job.id)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white py-20 text-center">
              <Briefcase className="h-12 w-12 text-zinc-200" />
              <div>
                <p className="font-semibold text-zinc-700">No jobs match your filters</p>
                <p className="mt-1 text-sm text-zinc-400">Try adjusting or clearing your filters</p>
              </div>
              <button
                onClick={resetFilters}
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="relative ml-auto h-full w-80 overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-bold text-zinc-900">Filters</h2>
              <button
                onClick={() => setFiltersOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <FilterPanel />
            <div className="mt-6">
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Show {filteredJobs.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
