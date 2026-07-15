"use client";

import { useState, type FormEvent } from "react";
import { Search, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  initialQuery?: string;
  initialLocation?: string;
  variant?: "hero" | "compact";
}

export function SearchBar({
  initialQuery = "",
  initialLocation = "",
  variant = "hero",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (location.trim()) params.set("location", location.trim());
    router.push(`/candidate/jobs?${params.toString()}`);
  };

  if (variant === "compact") {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md items-center gap-2"
      >
        <label className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
          <Search className="h-4 w-4 shrink-0 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs..."
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
          />
        </label>
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
        >
          Search
        </button>
      </form>
    );
  }

  // Hero variant
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg shadow-blue-100/50 sm:flex-row">
        {/* Job title / keyword */}
        <label className="flex flex-1 items-center gap-3 border-b border-zinc-100 px-5 py-4 sm:border-b-0 sm:border-r focus-within:bg-blue-50/30">
          <Search className="h-5 w-5 shrink-0 text-blue-400" />
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Job Title / Keywords
            </p>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. React Developer, Data Scientist..."
              className="mt-0.5 w-full bg-transparent text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400"
            />
          </div>
        </label>

        {/* Location */}
        <label className="flex flex-1 items-center gap-3 px-5 py-4 focus-within:bg-blue-50/30">
          <MapPin className="h-5 w-5 shrink-0 text-blue-400" />
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Location
            </p>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country or Remote"
              className="mt-0.5 w-full bg-transparent text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400"
            />
          </div>
        </label>

        {/* Search button */}
        <div className="flex items-center border-t border-zinc-100 p-3 sm:border-l sm:border-t-0">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] sm:w-auto"
          >
            <Search className="h-4 w-4" />
            Search Jobs
          </button>
        </div>
      </div>
    </form>
  );
}
