"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, getData } from "@/lib/api";
import { DashboardCard } from "@/components/super-admin/dashboard-card";
import { Briefcase, CheckCircle, PauseCircle, Users, Search, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import JobsTable from "@/components/hr/jobs-table";

export default function JobsPage() {
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, openings: 0 });
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination and Filtering State
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalJobs, setTotalJobs] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [searchInput, setSearchInput] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        perPage: String(perPage),
      });
      if (search) queryParams.append("search", search);
      if (status && status !== "ALL") queryParams.append("status", status);

      const res = await api.get(`/api/v1/jobs?${queryParams.toString()}`);
      const data = getData(res) as any;
      setJobs(data.jobs ?? []);
      setTotalJobs(data.total ?? 0);
      setStats({
        total: data.total ?? 0,
        active: data.active ?? 0,
        inactive: data.inactive ?? 0,
        openings: data.openings ?? 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, perPage, search, status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("ALL");
    setPage(1);
  };

  const totalPages = Math.ceil(totalJobs / perPage);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Jobs</h1>
          <p className="text-sm text-zinc-500">Manage all job postings, monitor job status, and openings.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/hr-management/jobs/create">
            <Button>Create New Job</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <DashboardCard title="Total Jobs" value={String(stats.total)} description="All job postings" icon={(<Briefcase className="text-blue-600" />) as any} trend="Total" />
        <DashboardCard title="Active Jobs" value={String(stats.active)} description="Published jobs" icon={(<CheckCircle className="text-green-600" />) as any} trend="Active" />
        <DashboardCard title="Inactive Jobs" value={String(stats.inactive)} description="Draft or closed" icon={(<PauseCircle className="text-zinc-600" />) as any} trend="Inactive" />
        <DashboardCard title="Open Positions" value={String(stats.openings)} description="Total openings" icon={(<Users className="text-purple-600" />) as any} trend="Openings" />
      </div>

      <div className="mt-8 mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2 w-full max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search jobs..."
              className="pl-8"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>

          {(search || status !== "ALL") && (
            <Button variant="ghost" onClick={handleResetFilters} className="px-2" title="Reset Filters">
              <FilterX className="h-4 w-4 mr-2" /> Reset
            </Button>
          )}
        </div>
      </div>

      <div className="mt-2">
        <JobsTable jobs={jobs} loading={loading} onRefresh={fetchData} />
      </div>

      {!loading && totalJobs > 0 && (
        <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
          <div className="text-zinc-500">
            Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, totalJobs)} of {totalJobs} results
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Rows per page:</span>
              <Select value={String(perPage)} onValueChange={(val) => { setPerPage(Number(val)); setPage(1); }}>
                <SelectTrigger className="w-[70px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="px-2 font-medium">Page {page} of {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
