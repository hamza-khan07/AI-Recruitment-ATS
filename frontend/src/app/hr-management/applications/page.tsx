"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Briefcase,
  TrendingUp,
  AlertCircle,
  CalendarHeart,
  MoreHorizontal,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { PageContainer } from "@/components/hr/hr-shell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MatchScoreBadge, type MatchLabel } from "@/components/hr/match-score-badge";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ApplicationStatus = "APPLIED" | "IN_REVIEW" | "SHORTLISTED" | "INTERVIEW" | "REJECTED" | "HIRED";

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  status: ApplicationStatus;
  createdAt: string;
  matchLabel: MatchLabel;
  job: { id: string; title: string; department: string | null };
  candidate: {
    id: string;
    name: string;
    email: string;
    candidateProfile: { avatar: string | null; title: string | null; location: string | null } | null;
  };
}

interface PaginatedResult {
  items: Application[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; dot: string }> = {
  APPLIED:     { label: "Applied",     color: "bg-blue-50 text-blue-700 ring-blue-100",   dot: "bg-blue-500"   },
  IN_REVIEW:   { label: "In Review",   color: "bg-amber-50 text-amber-700 ring-amber-100", dot: "bg-amber-500"  },
  SHORTLISTED: { label: "Shortlisted", color: "bg-purple-50 text-purple-700 ring-purple-100", dot: "bg-purple-500" },
  INTERVIEW:   { label: "Interview",   color: "bg-indigo-50 text-indigo-700 ring-indigo-100", dot: "bg-indigo-500" },
  REJECTED:    { label: "Rejected",    color: "bg-red-50 text-red-700 ring-red-100",      dot: "bg-red-500"    },
  HIRED:       { label: "Hired",       color: "bg-green-50 text-green-700 ring-green-100", dot: "bg-green-500"  },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as ApplicationStatus[];

const NEXT_STATUSES: Partial<Record<ApplicationStatus, ApplicationStatus[]>> = {
  APPLIED:     ["IN_REVIEW", "SHORTLISTED", "REJECTED"],
  IN_REVIEW:   ["SHORTLISTED", "REJECTED"],
  SHORTLISTED: ["INTERVIEW", "REJECTED"],
  INTERVIEW:   ["HIRED", "REJECTED"],
};

// ─── Helper ─────────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-PK", { day: "numeric", month: "short" });
}

// ─── Stat Cards ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-zinc-200 bg-white px-3 py-3">
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-zinc-900">{value}</p>
        <p className="truncate text-[11px] font-medium text-zinc-500">{label}</p>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await api.get(`/api/v1/applications?${params}`);
      setData(res.data?.data ?? null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchApplications, 300);
    return () => clearTimeout(timer);
  }, [fetchApplications]);

  // Reset to page 1 on filter change
  useEffect(() => { setPage(1); }, [search, statusFilter, perPage]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.patch(`/api/v1/applications/${id}/status`, { status });
      fetchApplications();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      await api.delete(`/api/v1/applications/${id}`);
      fetchApplications();
    } catch (error: any) {
      console.error("Failed to delete application", error);
      alert("Failed to delete application: " + (error.response?.data?.message || error.message));
    }
  };

  // Compute stats from current full data
  const stats = {
    total:       data?.total ?? 0,
    applied:     data?.items.filter((a) => a.status === "APPLIED").length ?? 0,
    shortlisted: data?.items.filter((a) => a.status === "SHORTLISTED").length ?? 0,
    interview:   data?.items.filter((a) => a.status === "INTERVIEW").length ?? 0,
    rejected:    data?.items.filter((a) => a.status === "REJECTED").length ?? 0,
    hired:       data?.items.filter((a) => a.status === "HIRED").length ?? 0,
  };

  return (
    <>
      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Apps" value={stats.total} icon={Users} color="bg-blue-50 text-blue-600" />
        <StatCard label="Applied" value={stats.applied} icon={TrendingUp} color="bg-blue-50 text-blue-600" />
        <StatCard label="Shortlisted" value={stats.shortlisted} icon={CheckCircle2} color="bg-purple-50 text-purple-600" />
        <StatCard label="Interview" value={stats.interview} icon={CalendarHeart} color="bg-indigo-50 text-indigo-600" />
        <StatCard label="Rejected" value={stats.rejected} icon={XCircle} color="bg-red-50 text-red-600" />
        <StatCard label="Hired" value={stats.hired} icon={Briefcase} color="bg-green-50 text-green-600" />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or job title…"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-9 pr-3 text-sm text-zinc-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-3 pr-8 text-sm text-zinc-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80">
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Candidate
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Job Applied
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Applied
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Resume
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  AI Match
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-zinc-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      <span className="text-sm">Loading applications…</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && data?.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <AlertCircle className="mx-auto mb-2 h-8 w-8 text-zinc-300" />
                    <p className="text-sm font-medium text-zinc-500">No applications found</p>
                    <p className="text-xs text-zinc-400">
                      {search || statusFilter ? "Try adjusting your filters." : "Applications will appear here once candidates apply."}
                    </p>
                  </td>
                </tr>
              )}
              {!loading && data?.items.map((app) => {
                const cfg = STATUS_CONFIG[app.status];
                const avatar = app.candidate.candidateProfile?.avatar;
                const nextStatuses = NEXT_STATUSES[app.status] ?? [];

                return (
                  <tr
                    key={app.id}
                    onClick={() => router.push(`/hr-management/applications/${app.id}`)}
                    className="cursor-pointer border-b border-zinc-100 transition hover:bg-zinc-50/70 last:border-0"
                  >
                    {/* Candidate */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-600 text-xs font-bold text-white">
                          {avatar && (avatar.startsWith("http") || avatar.startsWith("/uploads")) ? (
                            <img src={avatar} alt={app.fullName} className="h-full w-full object-cover" />
                          ) : (
                            getInitials(app.fullName)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-zinc-900">{app.fullName}</p>
                          <p className="truncate text-xs text-zinc-400">{app.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Job */}
                    <td className="px-3 py-3">
                      <p className="font-medium text-zinc-800">{app.job.title}</p>
                      {app.job.department && (
                        <p className="text-xs text-zinc-400">{app.job.department}</p>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                          cfg.color
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                        {cfg.label}
                      </span>
                    </td>
                    {/* Applied date */}
                    <td className="px-3 py-3 text-zinc-500">{timeAgo(app.createdAt)}</td>
                    {/* Resume */}
                    <td className="px-3 py-3">
                      {app.resumeUrl ? (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          View PDF
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-300">—</span>
                      )}
                    </td>
                    {/* AI Match */}
                    <td className="px-3 py-3">
                      <MatchScoreBadge matchLabel={app.matchLabel} size="sm" />
                    </td>
                    {/* Actions */}
                    <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-600">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl border border-zinc-200 bg-white py-1 shadow-xl">
                          <DropdownMenuLabel className="text-xs font-semibold text-zinc-400">Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/hr-management/applications/${app.id}`} className="flex items-center gap-2 cursor-pointer">
                              <Eye className="h-4 w-4" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => handleDelete(app.id)} className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
                            <Trash2 className="h-4 w-4" /> Delete Application
                          </DropdownMenuItem>

                          {nextStatuses.length > 0 && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                                Move to
                              </DropdownMenuLabel>
                              {nextStatuses.map((s) => {
                                const stCfg = STATUS_CONFIG[s];
                                return (
                                  <DropdownMenuItem
                                    key={s}
                                    onClick={() => handleStatusChange(app.id, s)}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <span className={cn("h-2 w-2 rounded-full", stCfg.dot)} />
                                    {stCfg.label}
                                  </DropdownMenuItem>
                                );
                              })}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-zinc-100 px-5 py-4 gap-4">
            <div className="text-sm text-zinc-500">
              Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, data.total)} of {data.total} results
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500">Rows per page:</span>
                <Select value={String(perPage)} onValueChange={(val) => setPerPage(Number(val))}>
                  <SelectTrigger className="w-16 h-8 rounded-lg border-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 20, 50].map((size) => (
                      <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="rounded-lg border-zinc-200 text-zinc-600"
                >
                  Previous
                </Button>
                <div className="px-2 text-sm font-medium text-zinc-700">
                  Page {page} of {data.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === data.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="rounded-lg border-zinc-200 text-zinc-600"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
