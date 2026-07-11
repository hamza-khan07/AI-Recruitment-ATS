"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export type ActivityLogStatus = "completed" | "pending" | "failed";

export interface ActivityLogEntry {
  id: string;
  action: string;
  user: string;
  company: string;
  timestamp: string;
  status: ActivityLogStatus;
}

import { useActivityLogs } from "@/hooks/useActivityLogs";

// We'll use API-provided logs when available; fall back to empty until loaded

const ITEMS_PER_PAGE = 8;

function StatusBadge({ status }: { status: ActivityLogStatus }) {
  const map = {
    completed: "bg-green-50 text-green-700 dark:bg-green-900/30",
    pending: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30",
    failed: "bg-red-50 text-red-700 dark:bg-red-900/30",
  } as const;

  const label = status === "completed" ? "Completed" : status === "pending" ? "Pending" : "Failed";

  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${map[status]}`}>{label}</span>;
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function ActivityLogsTable() {
  const { logs: fetched, loading, error } = useActivityLogs();
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (fetched) setLogs(fetched);
  }, [fetched]);

  const filteredLogs = useMemo(() => {
    const fromTimestamp = fromDate ? new Date(fromDate).getTime() : null;
    const toTimestamp = toDate ? new Date(toDate).getTime() : null;

    return logs.filter((entry) => {
      const normalized = query.toLowerCase();
      const matchesQuery =
        entry.action.toLowerCase().includes(normalized) ||
        entry.user.toLowerCase().includes(normalized) ||
        entry.company.toLowerCase().includes(normalized);

      if (!matchesQuery) return false;

      const entryTime = new Date(entry.timestamp).getTime();
      if (fromTimestamp !== null && entryTime < fromTimestamp) return false;
      if (toTimestamp !== null && entryTime > toTimestamp + 86_399_999) return false;

      return true;
    });
  }, [query, fromDate, toDate]);

  const pageCount = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const currentLogs = filteredLogs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function handleReset() {
    setQuery("");
    setFromDate("");
    setToDate("");
    setPage(1);
  }

  return (
    <Card className="rounded-[1.75rem] border-zinc-200 dark:border-zinc-800">
      <CardHeader className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Activity Logs</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Track system activity with search, date filters, and pagination.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span>{filteredLogs.length} records</span>
            <span>•</span>
            <span>Page {page} of {pageCount}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-6 py-6">
        <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_auto]">
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search actions, users, or companies"
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-sm outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="date"
              value={fromDate}
              onChange={(event) => {
                setFromDate(event.target.value);
                setPage(1);
              }}
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            />
            <input
              type="date"
              value={toDate}
              onChange={(event) => {
                setToDate(event.target.value);
                setPage(1);
              }}
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-primary dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>

          <div className="flex items-center justify-end">
            <Button variant="secondary" size="sm" onClick={handleReset}>
              Reset Filters
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] table-auto text-left text-sm text-zinc-600 dark:text-zinc-400">
            <thead>
              <tr className="text-zinc-500 dark:text-zinc-400">
                <th className="pb-3 pr-6">Action</th>
                <th className="pb-3 pr-6">User</th>
                <th className="pb-3 pr-6">Company</th>
                <th className="pb-3 pr-6">Timestamp</th>
                <th className="pb-3 pr-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Loading activity...</td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No records found.</td>
                </tr>
              )}

              {!loading && !error && currentLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No activity records found.
                  </td>
                </tr>
                ) : (
                  currentLogs.map((entry) => (
                  <tr key={entry.id} className="border-t border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
                    <td className="py-4 pr-6 font-medium text-zinc-950 dark:text-white">{entry.action}</td>
                    <td className="py-4 pr-6">{entry.user}</td>
                    <td className="py-4 pr-6">{entry.company}</td>
                    <td className="py-4 pr-6">{formatTimestamp(entry.timestamp)}</td>
                    <td className="py-4 pr-6">
                      <StatusBadge status={entry.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <div>
            Showing {currentLogs.length} of {filteredLogs.length} records
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
