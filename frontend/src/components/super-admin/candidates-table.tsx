"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CandidateActions, type Candidate } from "./candidate-actions";
import { useCandidates } from "@/hooks/useCandidates";
import api from "@/lib/api";

const MOCK_CANDIDATES: Candidate[] = [
  {
    id: "cand1",
    name: "Ava Johnson",
    email: "ava.johnson@example.com",
    appliedJobs: 4,
    resumeUploaded: true,
    registrationDate: "2024-05-19",
    status: "active",
  },
  {
    id: "cand2",
    name: "Ethan Myers",
    email: "ethan.myers@example.com",
    appliedJobs: 2,
    resumeUploaded: false,
    registrationDate: "2024-06-01",
    status: "pending",
  },
  {
    id: "cand3",
    name: "Zara Patel",
    email: "zara.patel@example.com",
    appliedJobs: 7,
    resumeUploaded: true,
    registrationDate: "2024-04-08",
    status: "active",
  },
  {
    id: "cand4",
    name: "Liam Nguyen",
    email: "liam.nguyen@example.com",
    appliedJobs: 1,
    resumeUploaded: true,
    registrationDate: "2024-06-25",
    status: "suspended",
  },
  {
    id: "cand5",
    name: "Mia Lopez",
    email: "mia.lopez@example.com",
    appliedJobs: 5,
    resumeUploaded: false,
    registrationDate: "2024-01-30",
    status: "active",
  },
];

function StatusBadge({ status }: { status: Candidate["status"] }) {
  const map = {
    active: "bg-green-50 text-green-700 dark:bg-green-900/30",
    suspended: "bg-orange-50 text-orange-700 dark:bg-orange-900/30",
    pending: "bg-zinc-50 text-zinc-700 dark:bg-zinc-800/30",
  } as const;

  const label = status === "active" ? "Active" : status === "suspended" ? "Suspended" : "Pending";

  return <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${map[status]}`}>{label}</span>;
}

function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export function CandidatesTable() {
  const { candidates: fetched, loading, error } = useCandidates();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [resumeFilter, setResumeFilter] = useState<string>("all");

  useEffect(() => {
    if (fetched) setCandidates(fetched);
  }, [fetched]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      if (statusFilter !== "all" && candidate.status !== statusFilter) return false;
      if (resumeFilter !== "all") {
        const hasResume = resumeFilter === "uploaded";
        if (candidate.resumeUploaded !== hasResume) return false;
      }
      if (query) {
        const normalized = query.toLowerCase();
        return (
          candidate.name.toLowerCase().includes(normalized) ||
          candidate.email.toLowerCase().includes(normalized)
        );
      }
      return true;
    });
  }, [candidates, query, statusFilter, resumeFilter]);

  function handleView(candidate: Candidate) {
    alert(`Candidate: ${candidate.name}\nEmail: ${candidate.email}\nApplied Jobs: ${candidate.appliedJobs}\nResume Uploaded: ${candidate.resumeUploaded ? "Yes" : "No"}\nRegistered: ${formatDate(candidate.registrationDate)}\nStatus: ${candidate.status}`);
  }

  function handleSuspend(id: string) {
    api.put(`/api/v1/candidates/${id}/suspend`).then(() => {
      setCandidates((prev) => prev.map((candidate) => (candidate.id === id ? { ...candidate, status: "suspended" } : candidate)));
    }).catch(() => alert("Failed to suspend candidate"));
  }

  function resetFilters() {
    setQuery("");
    setStatusFilter("all");
    setResumeFilter("all");
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search candidates"
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={resumeFilter}
            onChange={(event) => setResumeFilter(event.target.value)}
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="all">All resumes</option>
            <option value="uploaded">Uploaded</option>
            <option value="missing">Missing</option>
          </select>
        </div>

        <div>
          <Button variant="default" size="sm" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-auto">
          <thead>
            <tr className="text-left text-sm text-zinc-500 dark:text-zinc-400">
              <th className="pb-3 pr-6">Candidate</th>
              <th className="pb-3 pr-6">Email</th>
              <th className="pb-3 pr-6">Applied Jobs</th>
              <th className="pb-3 pr-6">Resume</th>
              <th className="pb-3 pr-6">Registration Date</th>
              <th className="pb-3 pr-6">Status</th>
              <th className="pb-3 pr-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Loading candidates...</td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No records found.</td>
              </tr>
            )}

            {!loading && !error && filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No candidates found.
                </td>
              </tr>
            ) : (
              filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="border-t border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
                  <td className="py-4 pr-6 align-middle">
                    <div className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{candidate.name}</div>
                  </td>
                  <td className="py-4 pr-6 align-middle text-sm text-zinc-600 dark:text-zinc-400">{candidate.email}</td>
                  <td className="py-4 pr-6 align-middle text-sm text-zinc-600 dark:text-zinc-400">{candidate.appliedJobs}</td>
                  <td className="py-4 pr-6 align-middle text-sm text-zinc-600 dark:text-zinc-400">
                    {candidate.resumeUploaded ? "Yes" : "No"}
                  </td>
                  <td className="py-4 pr-6 align-middle text-sm text-zinc-600 dark:text-zinc-400">
                    {formatDate(candidate.registrationDate)}
                  </td>
                  <td className="py-4 pr-6 align-middle">
                    <StatusBadge status={candidate.status} />
                  </td>
                  <td className="py-4 pr-6 align-middle">
                    <CandidateActions candidate={candidate} onView={handleView} onSuspend={handleSuspend} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
