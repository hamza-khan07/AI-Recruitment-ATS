"use client";

import { useEffect, useMemo, useState } from "react";
import { CompanyActions, type Company } from "./company-actions";
import { Button } from "@/components/ui/button";
import { useCompanies } from "@/hooks/useCompanies";
import api from "@/lib/api";

const MOCK_COMPANIES: Company[] = [
  {
    id: "c1",
    name: "Acme Corp",
    status: "active",
    logoUrl: null,
    joinedAt: "2024-01-10",
    hrUsers: 6,
    jobs: 12,
    description: "Global supplier of roadrunner deterrents",
  },
  {
    id: "c2",
    name: "Beta Solutions",
    status: "pending",
    logoUrl: null,
    joinedAt: "2024-05-02",
    hrUsers: 2,
    jobs: 3,
    description: "Consulting and integration services",
  },
  {
    id: "c3",
    name: "Gamma Studios",
    status: "suspended",
    logoUrl: null,
    joinedAt: "2023-07-12",
    hrUsers: 4,
    jobs: 0,
    description: "Creative agency",
  },
  {
    id: "c4",
    name: "Delta Retail",
    status: "active",
    logoUrl: null,
    joinedAt: "2022-12-01",
    hrUsers: 10,
    jobs: 20,
    description: "Retail chain",
  },
];

function StatusBadge({ status }: { status: Company["status"] }) {
  const map = {
    active: "bg-green-50 text-green-700 dark:bg-green-900/30",
    suspended: "bg-orange-50 text-orange-700 dark:bg-orange-900/30",
    pending: "bg-zinc-50 text-zinc-700 dark:bg-zinc-800/30",
  } as const;

  const label = status === "active" ? "Active" : status === "suspended" ? "Suspended" : "Pending";

  return <span className={"inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold " + map[status]}>{label}</span>;
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    // Use a fixed locale and options so server and client render the same string
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch (e) {
    return dateStr;
  }
}

export function CompaniesTable() {
  const { companies: fetched, loading, error } = useCompanies();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [companies, query, statusFilter]);

  useEffect(() => {
    if (fetched) setCompanies(fetched);
  }, [fetched]);

  function handleView(c: Company) {
    setSelected(c.id);
    // simple view modal via alert for now
    alert(`Company: ${c.name}\n\n${c.description || "No description"}`);
    setSelected(null);
  }

  function handleSuspend(id: string) {
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, status: "suspended" } : c)));
  }

  function handleActivate(id: string) {
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, status: "active" } : c)));
  }

  function handleDelete(id: string) {
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company name"
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div>
          <Button variant="default" size="sm" onClick={() => { setCompanies(fetched ?? MOCK_COMPANIES); setQuery(""); setStatusFilter("all"); }}>
            Reset
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-sm text-zinc-500">
              <th className="pb-3 pr-6">Company</th>
              <th className="pb-3 pr-6">Status</th>
              <th className="pb-3 pr-6">Date Joined</th>
              <th className="pb-3 pr-6">HR Users</th>
              <th className="pb-3 pr-6">Jobs</th>
              <th className="pb-3 pr-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-zinc-500">Loading companies...</td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No records found.</td>
              </tr>
            )}

            {!loading && !error && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-zinc-500">No companies found.</td>
              </tr>
            )}

            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
                <td className="py-4 pr-6 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-none overflow-hidden rounded-full bg-zinc-100 text-center leading-10 dark:bg-zinc-800">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{c.name.split(" ").map((s) => s[0]).slice(0,2).join("")}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{c.name}</div>
                    </div>
                  </div>
                </td>

                <td className="py-4 pr-6 align-middle">
                  <StatusBadge status={c.status} />
                </td>

                <td className="py-4 pr-6 align-middle text-sm text-zinc-600 dark:text-zinc-400">{formatDate(c.joinedAt)}</td>

                <td className="py-4 pr-6 align-middle text-sm text-zinc-600 dark:text-zinc-400">{c.hrUsers}</td>

                <td className="py-4 pr-6 align-middle text-sm text-zinc-600 dark:text-zinc-400">{c.jobs}</td>

                <td className="py-4 pr-6 align-middle">
                  <CompanyActions
                    company={c}
                    onView={handleView}
                    onSuspend={handleSuspend}
                    onActivate={handleActivate}
                    onDelete={handleDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
