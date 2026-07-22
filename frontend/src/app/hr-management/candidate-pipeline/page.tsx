"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Search,
  X,
  ExternalLink,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  GripVertical,
  ChevronRight,
  User,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { MatchScoreBadge, type MatchLabel } from "@/components/hr/match-score-badge";

// ─── Types ──────────────────────────────────────────────────────────────────────

type ApplicationStatus =
  | "APPLIED"
  | "IN_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "REJECTED"
  | "HIRED";

export interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  status: ApplicationStatus;
  rating?: number | null;
  notes?: string | null;
  interviewDate?: string | null;
  interviewEndTime?: string | null;
  createdAt: string;
  matchLabel?: MatchLabel;
  job: { id: string; title: string; department: string | null };
  candidate: {
    id: string;
    name: string;
    email: string;
    candidateProfile: {
      avatar: string | null;
      title: string | null;
      location: string | null;
      skills?: string[];
      linkedinUrl?: string | null;
      portfolioUrl?: string | null;
      bio?: string | null;
    } | null;
  };
}

// ─── Config ──────────────────────────────────────────────────────────────────────

const COLUMNS: { id: ApplicationStatus; label: string; accent: string; headerBg: string; dot: string }[] = [
  { id: "APPLIED",     label: "Applied",     accent: "border-blue-400",   headerBg: "bg-blue-50",   dot: "bg-blue-500"   },
  { id: "IN_REVIEW",  label: "In Review",   accent: "border-amber-400",  headerBg: "bg-amber-50",  dot: "bg-amber-500"  },
  { id: "SHORTLISTED",label: "Shortlisted", accent: "border-purple-400", headerBg: "bg-purple-50", dot: "bg-purple-500" },
  { id: "INTERVIEW",  label: "Interview",   accent: "border-indigo-400", headerBg: "bg-indigo-50", dot: "bg-indigo-500" },
  { id: "HIRED",      label: "Hired",       accent: "border-green-400",  headerBg: "bg-green-50",  dot: "bg-green-500"  },
  { id: "REJECTED",   label: "Rejected",    accent: "border-red-400",    headerBg: "bg-red-50",    dot: "bg-red-500"    },
];

const STATUS_BADGE: Record<ApplicationStatus, string> = {
  APPLIED:     "bg-blue-100 text-blue-700",
  IN_REVIEW:   "bg-amber-100 text-amber-700",
  SHORTLISTED: "bg-purple-100 text-purple-700",
  INTERVIEW:   "bg-indigo-100 text-indigo-700",
  REJECTED:    "bg-red-100 text-red-700",
  HIRED:       "bg-green-100 text-green-700",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-PK", { day: "numeric", month: "short" });
}

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-indigo-600",
  "bg-violet-600",
  "bg-rose-600",
  "bg-amber-600",
  "bg-teal-600",
];
function avatarColor(id: string) {
  const idx = id.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// ─── Candidate Card ───────────────────────────────────────────────────────────────

function CandidateCard({
  app,
  index,
  onClick,
}: {
  app: Application;
  index: number;
  onClick: () => void;
}) {
  const avatar = app.candidate.candidateProfile?.avatar;
  const initials = getInitials(app.fullName);
  const color = avatarColor(app.id);

  return (
    <Draggable draggableId={app.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "group relative flex flex-col gap-3 rounded-2xl border bg-white p-3.5 transition-all duration-150 cursor-pointer select-none",
            snapshot.isDragging
              ? "border-blue-300 shadow-xl shadow-blue-100/50 rotate-1 scale-[1.02]"
              : "border-zinc-200 hover:border-zinc-300 hover:shadow-md shadow-sm"
          )}
          onClick={onClick}
        >
          {/* Drag handle */}
          <div
            {...provided.dragHandleProps}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-2 top-2 hidden group-hover:flex items-center justify-center text-zinc-300 hover:text-zinc-500 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Header row */}
          <div className="flex items-center gap-2.5 pr-5">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl text-xs font-bold text-white",
                avatar ? "" : color
              )}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={app.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900 leading-tight">
                {app.fullName}
              </p>
              <p className="truncate text-xs text-zinc-400 leading-tight mt-0.5">
                {app.email}
              </p>
            </div>
          </div>

          {/* Job info */}
          <div className="flex items-start gap-2">
            <Briefcase className="h-3.5 w-3.5 shrink-0 mt-0.5 text-zinc-400" />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-zinc-700">
                {app.job.title}
              </p>
              {app.job.department && (
                <p className="text-[11px] text-zinc-400">{app.job.department}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-[11px] text-zinc-400">
              <Calendar className="h-3 w-3" />
              {timeAgo(app.createdAt)}
            </div>
            <div className="flex items-center gap-1.5">
              {app.matchLabel && (
                <MatchScoreBadge matchLabel={app.matchLabel} size="sm" />
              )}
              {app.resumeUrl && !app.matchLabel && (
                <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                  Resume ✓
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

// ─── Side Drawer ─────────────────────────────────────────────────────────────────

export function SideDrawer({
  app,
  onClose,
  onStatusChange,
  onUpdateApp,
}: {
  app: Application | null;
  onClose: () => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onUpdateApp: (id: string, updates: Partial<Application>) => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [interviewDate, setInterviewDate] = useState<string>("");
  const [interviewEndTime, setInterviewEndTime] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (app) {
      setRating(app.rating || 0);
      setNotes(app.notes || "");
      // Convert UTC to local datetime-local format if exists
      if (app.interviewDate) {
        const d = new Date(app.interviewDate);
        const tzOffset = d.getTimezoneOffset() * 60000;
        const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
        setInterviewDate(localISOTime);
      } else {
        setInterviewDate("");
      }
      if (app.interviewEndTime) {
        const d = new Date(app.interviewEndTime);
        const tzOffset = d.getTimezoneOffset() * 60000;
        const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
        setInterviewEndTime(localISOTime);
      } else {
        setInterviewEndTime("");
      }
    }
  }, [app]);

  const saveDetails = async (updates: Partial<Application>) => {
    if (!app) return;
    setIsSaving(true);
    try {
      // Validate time between 9am and 5pm if provided
      if (updates.interviewDate) {
        const d = new Date(updates.interviewDate);
        if (d.getHours() < 9 || d.getHours() >= 17) {
           alert("Interview Start Time must be between 9 AM and 5 PM");
           setIsSaving(false);
           return;
        }
      }
      if (updates.interviewEndTime) {
        const d = new Date(updates.interviewEndTime);
        if (d.getHours() < 9 || (d.getHours() === 17 && d.getMinutes() > 0) || d.getHours() > 17) {
           alert("Interview End Time must be between 9 AM and 5 PM");
           setIsSaving(false);
           return;
        }
      }

      // For interviewDate, convert local to UTC ISO string if provided
      const payload: any = { ...updates };
      if (updates.interviewDate) {
        payload.interviewDate = new Date(updates.interviewDate).toISOString();
      }
      if (updates.interviewEndTime) {
        payload.interviewEndTime = new Date(updates.interviewEndTime).toISOString();
      }
      
      const { data } = await api.patch(`/api/v1/applications/${app.id}/details`, payload);
      onUpdateApp(app.id, updates);
    } catch (error) {
      console.error("Failed to update details:", error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!app) return null;

  const profile = app.candidate.candidateProfile;
  const avatar = profile?.avatar;
  const initials = getInitials(app.fullName);
  const color = avatarColor(app.id);

  const NEXT: Partial<Record<ApplicationStatus, ApplicationStatus[]>> = {
    APPLIED:     ["IN_REVIEW", "SHORTLISTED", "REJECTED"],
    IN_REVIEW:   ["SHORTLISTED", "REJECTED"],
    SHORTLISTED: ["INTERVIEW", "REJECTED"],
    INTERVIEW:   ["HIRED", "REJECTED"],
  };

  const nextStatuses = NEXT[app.status] ?? [];
  const colCfg = COLUMNS.find((c) => c.id === app.status);

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-100 px-6 py-5">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-base font-bold text-white",
                avatar ? "" : color
              )}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={app.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">
                {app.fullName}
              </h2>
              {profile?.title && (
                <p className="text-sm text-zinc-500">{profile.title}</p>
              )}
              {colCfg && (
                <span
                  className={cn(
                    "mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    STATUS_BADGE[app.status]
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", colCfg.dot)} />
                  {colCfg.label}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="shrink-0 text-zinc-400"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Rating Section */}
        <div className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Rating</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => {
                  setRating(star);
                  saveDetails({ rating: star });
                }}
                className={cn(
                  "transition-colors hover:text-amber-400",
                  rating >= star ? "text-amber-400" : "text-zinc-200"
                )}
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Contact Info */}
          <div className="border-b border-zinc-100 px-6 py-4 space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Contact</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-sm text-zinc-700">
                <Mail className="h-4 w-4 shrink-0 text-zinc-400" />
                <a href={`mailto:${app.email}`} className="hover:underline">{app.email}</a>
              </div>
              {app.phone && (
                <div className="flex items-center gap-2.5 text-sm text-zinc-700">
                  <Phone className="h-4 w-4 shrink-0 text-zinc-400" />
                  {app.phone}
                </div>
              )}
              {profile?.location && (
                <div className="flex items-center gap-2.5 text-sm text-zinc-700">
                  <MapPin className="h-4 w-4 shrink-0 text-zinc-400" />
                  {profile.location}
                </div>
              )}
            </div>
          </div>

          {/* Applied for */}
          <div className="border-b border-zinc-100 px-6 py-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Applied For</p>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="font-semibold text-zinc-900">{app.job.title}</p>
              {app.job.department && (
                <p className="text-xs text-zinc-500 mt-0.5">{app.job.department}</p>
              )}
              <p className="text-xs text-zinc-400 mt-1">Applied {timeAgo(app.createdAt)}</p>
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <div className="border-b border-zinc-100 px-6 py-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">About</p>
              <p className="text-sm text-zinc-700 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Skills */}
          {profile?.skills && profile.skills.length > 0 && (
            <div className="border-b border-zinc-100 px-6 py-4 space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Skills</p>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(profile?.linkedinUrl || profile?.portfolioUrl) && (
            <div className="border-b border-zinc-100 px-6 py-4 space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Links</p>
              <div className="space-y-2">
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    LinkedIn Profile
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Resume */}
          {app.resumeUrl && (
            <div className="border-b border-zinc-100 px-6 py-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Resume</p>
              <a
                href={app.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-800">Resume / CV</p>
                  <p className="text-xs text-zinc-400">Click to open PDF</p>
                </div>
                <ExternalLink className="ml-auto h-4 w-4 text-zinc-400" />
              </a>
            </div>
          )}

          {/* Interview Scheduling */}
          <div className="border-b border-zinc-100 px-6 py-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Interview Schedule</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-12 text-xs font-medium text-zinc-500">Start</span>
                <input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-12 text-xs font-medium text-zinc-500">End</span>
                <input
                  type="datetime-local"
                  value={interviewEndTime}
                  onChange={(e) => setInterviewEndTime(e.target.value)}
                  className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveDetails({ 
                  interviewDate: interviewDate || null,
                  interviewEndTime: interviewEndTime || null 
                })}
                disabled={isSaving}
                className="w-full mt-2 rounded-xl"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Times"}
              </Button>
            </div>
          </div>

          {/* HR Notes */}
          <div className="border-b border-zinc-100 px-6 py-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">HR Notes</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-blue-600 hover:bg-transparent hover:text-blue-700 hover:underline"
                onClick={() => saveDetails({ notes })}
                disabled={isSaving}
              >
                Save Notes
              </Button>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add private notes about this candidate..."
              className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
              rows={4}
            />
          </div>
        </div>

        {/* Footer — Move Stage */}
        {nextStatuses.length > 0 && (
          <div className="border-t border-zinc-100 bg-zinc-50 px-6 py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Move to Stage
            </p>
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((s) => {
                const cfg = COLUMNS.find((c) => c.id === s)!;
                return (
                  <button
                    key={s}
                    onClick={() => {
                      onStatusChange(app.id, s);
                      onClose();
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition hover:opacity-80",
                      cfg.headerBg,
                      cfg.accent
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full", cfg.dot)} />
                    {cfg.label}
                    <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────────

export default function CandidatePipelinePage() {
  const [allApps, setAllApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [searchJob, setSearchJob] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/applications?page=1&perPage=200");
      setAllApps(res.data?.data?.items ?? []);
    } catch {
      setAllApps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.patch(`/api/v1/applications/${id}/status`, { status });
      setAllApps((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: status as ApplicationStatus } : a))
      );
    } catch {}
  };

  const handleDragEnd = (result: DropResult) => {
    const { draggableId, destination } = result;
    if (!destination) return;
    const newStatus = destination.droppableId as ApplicationStatus;
    handleStatusChange(draggableId, newStatus);
  };

  // Filter
  const filtered = allApps.filter((a) => {
    const matchName =
      !searchName ||
      a.fullName.toLowerCase().includes(searchName.toLowerCase()) ||
      a.email.toLowerCase().includes(searchName.toLowerCase());
    const matchJob =
      !searchJob || a.job.title.toLowerCase().includes(searchJob.toLowerCase());
    return matchName && matchJob;
  });

  // Group by status
  const grouped = COLUMNS.reduce<Record<ApplicationStatus, Application[]>>(
    (acc, col) => {
      acc[col.id] = filtered.filter((a) => a.status === col.id);
      return acc;
    },
    {} as Record<ApplicationStatus, Application[]>
  );

  // Unique job titles for suggestion
  const jobTitles = Array.from(new Set(allApps.map((a) => a.job.title)));

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {/* Candidate Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Search candidate…"
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          {searchName && (
            <button
              onClick={() => setSearchName("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Job Title Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={searchJob}
            onChange={(e) => setSearchJob(e.target.value)}
            placeholder="Filter by job title…"
            list="job-titles"
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <datalist id="job-titles">
            {jobTitles.map((t) => <option key={t} value={t} />)}
          </datalist>
          {searchJob && (
            <button
              onClick={() => setSearchJob("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <p className="ml-auto text-sm text-zinc-400">
          {filtered.length} candidate{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-1 items-center justify-center gap-3 text-zinc-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm">Loading pipeline…</span>
        </div>
      )}

      {/* Kanban Board */}
      {!loading && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex flex-1 gap-3 overflow-x-auto pb-4 items-start">
            {COLUMNS.map((col) => {
              const cards = grouped[col.id];
              return (
                <div
                  key={col.id}
                  className="flex w-64 shrink-0 flex-col rounded-2xl border border-zinc-200 bg-zinc-50/80"
                >
                  {/* Column header */}
                  <div
                    className={cn(
                      "flex items-center justify-between rounded-t-2xl border-b-2 px-4 py-3",
                      col.headerBg,
                      col.accent
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2.5 w-2.5 rounded-full", col.dot)} />
                      <span className="text-sm font-semibold text-zinc-800">
                        {col.label}
                      </span>
                    </div>
                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white/70 px-1.5 text-xs font-bold text-zinc-700 shadow-sm">
                      {cards.length}
                    </span>
                  </div>

                  {/* Droppable area */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "flex flex-col gap-2.5 p-2.5 transition-colors min-h-[120px]",
                          snapshot.isDraggingOver
                            ? "bg-blue-50/60"
                            : "bg-transparent"
                        )}
                      >
                        {cards.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-6 text-center">
                            <User className="mb-1.5 h-6 w-6 text-zinc-300" />
                            <p className="text-xs text-zinc-400">No candidates</p>
                          </div>
                        )}
                        {cards.map((app, index) => (
                          <CandidateCard
                            key={app.id}
                            app={app}
                            index={index}
                            onClick={() => setSelectedApp(app)}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Side Drawer */}
      <SideDrawer
        app={selectedApp}
        onClose={() => setSelectedApp(null)}
        onStatusChange={(id, status) => {
          handleStatusChange(id, status);
          setSelectedApp((prev) => (prev?.id === id ? { ...prev, status } : prev));
        }}
        onUpdateApp={(id, updates) => {
          setAllApps((prev) =>
            prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
          );
          setSelectedApp((prev) => (prev?.id === id ? { ...prev, ...updates } : prev));
        }}
      />
    </div>
  );
}
