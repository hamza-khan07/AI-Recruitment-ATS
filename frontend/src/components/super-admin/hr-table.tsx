"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { HRActions, type HRUser } from "./hr-actions";
import { useHRUsers } from "@/hooks/useHRUsers";
import api from "@/lib/api";

function StatusBadge({ status }: { status: HRUser["status"] }) {
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
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export function HRTable() {
  const { hrUsers: fetched, loading, error } = useHRUsers();
  const [users, setUsers] = useState<HRUser[]>([]);
  const [query, setQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (fetched) setUsers(fetched);
  }, [fetched]);

  const companies = useMemo(() => Array.from(new Set(users.map((user) => user.company))), [users]);

  const filtered = useMemo(() => {
    return users.filter((user) => {
      if (companyFilter !== "all" && user.company !== companyFilter) return false;
      if (statusFilter !== "all" && user.status !== statusFilter) return false;
      if (query) {
        const normalized = query.toLowerCase();
        return (
          user.name.toLowerCase().includes(normalized) ||
          user.email.toLowerCase().includes(normalized) ||
          user.company.toLowerCase().includes(normalized)
        );
      }
      return true;
    });
  }, [users, query, companyFilter, statusFilter]);

  function handleView(user: HRUser) {
    alert(`HR User: ${user.name}\nEmail: ${user.email}\nCompany: ${user.company}\nRole: ${user.role}\nStatus: ${user.status}`);
  }

  function handleSuspend(id: string) {
    api.put(`/api/v1/hr/${id}/suspend`).then(() => {
      setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, status: "suspended" } : user)));
    }).catch(() => alert("Failed to suspend user"));
  }

  function handleActivate(id: string) {
    api.put(`/api/v1/hr/${id}/activate`).then(() => {
      setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, status: "active" } : user)));
    }).catch(() => alert("Failed to activate user"));
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, or company"
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          />

          <select
            value={companyFilter}
            onChange={(event) => setCompanyFilter(event.target.value)}
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="all">All companies</option>
            {companies.map((company) => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>

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
        </div>

        <div>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setQuery("");
              setCompanyFilter("all");
              setStatusFilter("all");
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-auto">
          <thead>
            <tr className="text-left text-sm text-zinc-500 dark:text-zinc-400">
              <th className="pb-3 pr-6">Name</th>
              <th className="pb-3 pr-6">Email</th>
              <th className="pb-3 pr-6">Company</th>
              <th className="pb-3 pr-6">Status</th>
              <th className="pb-3 pr-6">Joined</th>
              <th className="pb-3 pr-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Loading HR users...</td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No records found.</td>
              </tr>
            )}

            {!loading && !error && filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No HR users found.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="border-t border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
                  <td className="py-4 pr-6 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                        {user.name
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{user.name}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">{user.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-6 align-middle text-sm text-zinc-600 dark:text-zinc-400">{user.email}</td>
                  <td className="py-4 pr-6 align-middle text-sm text-zinc-600 dark:text-zinc-400">{user.company}</td>
                  <td className="py-4 pr-6 align-middle">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="py-4 pr-6 align-middle text-sm text-zinc-600 dark:text-zinc-400">{formatDate(user.joinedAt)}</td>
                  <td className="py-4 pr-6 align-middle">
                    <HRActions user={user} onView={handleView} onSuspend={handleSuspend} onActivate={handleActivate} />
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
