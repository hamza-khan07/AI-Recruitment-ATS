"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MoreHorizontal, Edit, Trash, Eye, Globe } from "lucide-react";
import { api } from "@/lib/api";

export default function JobsTable({ jobs, loading, onRefresh }: { jobs: any[]; loading: boolean; onRefresh: () => void }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "DRAFT": return <Badge variant="secondary">Draft</Badge>;
      case "CLOSED": return <Badge variant="destructive">Closed</Badge>;
      case "ARCHIVED": return <Badge variant="outline">Archived</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await api.patch(`/api/v1/jobs/${id}/status`, { status: newStatus });
    onRefresh();
  };

  const handleDelete = async () => {
    if (jobToDelete) {
      await api.delete(`/api/v1/jobs/${jobToDelete}`);
      setJobToDelete(null);
      onRefresh();
    }
  };

  if (loading) return <div className="rounded-md border p-8 text-center text-zinc-500">Loading jobs...</div>;
  if (!jobs || jobs.length === 0) return <div className="rounded-md border p-8 text-center text-zinc-500">No jobs found. Create one to get started.</div>;

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow>
              <TableHead className="w-12"><Checkbox onCheckedChange={(c) => {
                const newSelected: Record<string, boolean> = {};
                jobs.forEach(j => newSelected[j.id] = !!c);
                setSelected(newSelected);
              }} /></TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Employment</TableHead>
              <TableHead>Openings</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Closing</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell><Checkbox checked={!!selected[job.id]} onCheckedChange={(c) => setSelected((s) => ({ ...s, [job.id]: !!c }))} /></TableCell>
                <TableCell>
                  <Link href={`/hr-management/jobs/${job.id}`} className="font-medium text-zinc-900 hover:underline">{job.title}</Link>
                  <div className="text-xs text-zinc-500">{job.department}</div>
                </TableCell>
                <TableCell>{job.employmentType || "—"}</TableCell>
                <TableCell>{job.openPositions || 0}</TableCell>
                <TableCell>{job.applications || 0}</TableCell>
                <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{job.deadline ? new Date(job.deadline).toLocaleDateString() : "—"}</TableCell>
                <TableCell>{getStatusBadge(job.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild><Link href={`/hr-management/jobs/${job.id}`}><Eye className="mr-2 h-4 w-4" /> View Details</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href={`/hr-management/jobs/${job.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit Job</Link></DropdownMenuItem>
                      {job.status !== "PUBLISHED" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(job.id, "PUBLISHED")}><Globe className="mr-2 h-4 w-4" /> Publish Job</DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer" onClick={() => setJobToDelete(job.id)}><Trash className="mr-2 h-4 w-4" /> Delete Job</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!jobToDelete} onOpenChange={(o) => !o && setJobToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>This action cannot be undone. This will permanently delete the job posting.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJobToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Job</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
