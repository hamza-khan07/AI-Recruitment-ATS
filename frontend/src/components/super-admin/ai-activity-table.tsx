"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export interface AiActivityEntry {
  id: string;
  type: "Job Description" | "Candidate Summary";
  user: string;
  company: string;
  generatedAt: string;
  status: "success" | "processing" | "failed";
}

import { useAiActivity } from "@/hooks/useAiActivity";


function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function StatusPill({ status }: { status: AiActivityEntry["status"] }) {
  const map = {
    success: "bg-green-50 text-green-700 dark:bg-green-900/30",
    processing: "bg-blue-50 text-blue-700 dark:bg-blue-900/30",
    failed: "bg-red-50 text-red-700 dark:bg-red-900/30",
  } as const;

  const label = status === "success" ? "Success" : status === "processing" ? "Processing" : "Failed";
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${map[status]}`}>{label}</span>;
}

export function AiActivityTable() {
  const { activities: fetched, loading, error } = useAiActivity();
  const [activity, setActivity] = useState<AiActivityEntry[]>([]);
  const [filter, setFilter] = useState<AiActivityEntry["type"] | "all">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (fetched) setActivity(fetched);
  }, [fetched]);

  const filteredActivity = useMemo(() => {
    return activity.filter((entry) => {
      if (filter !== "all" && entry.type !== filter) return false;
      const normalized = query.toLowerCase();
      return (
        entry.user.toLowerCase().includes(normalized) ||
        entry.company.toLowerCase().includes(normalized) ||
        entry.type.toLowerCase().includes(normalized)
      );
    });
  }, [filter, query, activity]);

  return (
    <Card className="rounded-[1.75rem] border-zinc-200 dark:border-zinc-800">
      <CardHeader className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Recent AI Activity</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Review the latest AI generation jobs and statuses.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span>{filteredActivity.length} entries</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-6 py-6">
        <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_minmax(180px,1fr)_auto]">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search activity by user, company, or type"
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-sm outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as AiActivityEntry["type"] | "all")}
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          >
            <option value="all">All activity types</option>
            <option value="Job Description">Job Description</option>
            <option value="Candidate Summary">Candidate Summary</option>
          </select>

          <div className="flex items-center justify-end">
            <Button variant="secondary" size="sm" onClick={() => { setFilter("all"); setQuery(""); }}>
              Clear
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] table-auto text-left text-sm text-zinc-600 dark:text-zinc-400">
            <thead>
              <tr className="text-zinc-500 dark:text-zinc-400">
                <th className="pb-3 pr-6">AI Type</th>
                <th className="pb-3 pr-6">User</th>
                <th className="pb-3 pr-6">Company</th>
                <th className="pb-3 pr-6">Generated At</th>
                <th className="pb-3 pr-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Loading AI activity...</td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-red-600 dark:text-red-400">Failed to load AI activity.</td>
                </tr>
              )}

              {!loading && !error && filteredActivity.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No AI activity found.
                  </td>
                </tr>
              ) : (
                  filteredActivity.map((entry) => (
                  <tr key={entry.id} className="border-t border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
                    <td className="py-4 pr-6 font-medium text-zinc-950 dark:text-white">{entry.type}</td>
                    <td className="py-4 pr-6">{entry.user}</td>
                    <td className="py-4 pr-6">{entry.company}</td>
                    <td className="py-4 pr-6">{formatDateTime(entry.generatedAt)}</td>
                    <td className="py-4 pr-6">
                      <StatusPill status={entry.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
