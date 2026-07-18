"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  FileText,
  Briefcase,
  GraduationCap,
  ExternalLink,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { PageContainer } from "@/components/hr/hr-shell";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ApplicationStatus = "APPLIED" | "IN_REVIEW" | "SHORTLISTED" | "INTERVIEW" | "REJECTED" | "HIRED";

interface ApplicationDetail {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  coverLetter: string | null;
  status: ApplicationStatus;
  createdAt: string;
  job: {
    id: string;
    title: string;
    department: string | null;
    location: string | null;
    employmentType: string | null;
    company: { id: string; name: string; logo: string | null };
  };
  candidate: {
    id: string;
    name: string;
    email: string;
    candidateProfile: {
      title: string | null;
      bio: string | null;
      phone: string | null;
      location: string | null;
      linkedinUrl: string | null;
      portfolioUrl: string | null;
      resumeUrl: string | null;
      avatar: string | null;
      skills: string[];
      workExperience: {
        id: string;
        role: string;
        company: string;
        startDate: string | null;
        endDate: string | null;
        current: boolean;
        description: string | null;
      }[];
      education: {
        id: string;
        degree: string;
        field: string | null;
        institution: string;
        startYear: string | null;
        endYear: string | null;
        current: boolean;
      }[];
    } | null;
  };
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; dot: string }> = {
  APPLIED:     { label: "Applied",     color: "bg-blue-50 text-blue-700 ring-blue-100",       dot: "bg-blue-500"   },
  IN_REVIEW:   { label: "In Review",   color: "bg-amber-50 text-amber-700 ring-amber-100",    dot: "bg-amber-500"  },
  SHORTLISTED: { label: "Shortlisted", color: "bg-purple-50 text-purple-700 ring-purple-100", dot: "bg-purple-500" },
  INTERVIEW:   { label: "Interview",   color: "bg-indigo-50 text-indigo-700 ring-indigo-100", dot: "bg-indigo-500" },
  REJECTED:    { label: "Rejected",    color: "bg-red-50 text-red-700 ring-red-100",          dot: "bg-red-500"    },
  HIRED:       { label: "Hired",       color: "bg-green-50 text-green-700 ring-green-100",    dot: "bg-green-500"  },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as ApplicationStatus[];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-zinc-900">
        <Icon className="h-4.5 w-4.5 text-blue-500" />
        {title}
      </h2>
      {children}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ApplicationDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    api.get(`/api/v1/applications/${id}`)
      .then((res) => setApp(res.data?.data ?? null))
      .catch(() => setApp(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status: string) => {
    if (!app) return;
    setUpdating(true);
    try {
      await api.patch(`/api/v1/applications/${id}/status`, { status });
      setApp((prev) => prev ? { ...prev, status: status as ApplicationStatus } : prev);
      setToast({ type: "success", msg: `Status updated to ${STATUS_CONFIG[status as ApplicationStatus]?.label}.` });
    } catch {
      setToast({ type: "error", msg: "Failed to update status." });
    } finally {
      setUpdating(false);
      setTimeout(() => setToast(null), 3500);
    }
  };

  if (loading) {
    return (
      <PageContainer title="Application Detail">
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </PageContainer>
    );
  }

  if (!app) {
    return (
      <PageContainer title="Application Detail">
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-zinc-500">
          <AlertCircle className="h-10 w-10 text-zinc-300" />
          <p className="font-medium">Application not found or you don&apos;t have access.</p>
          <Link href="/hr-management/applications" className="text-sm text-blue-600 hover:underline">
            ← Back to Applications
          </Link>
        </div>
      </PageContainer>
    );
  }

  const profile = app.candidate.candidateProfile;
  const cfg = STATUS_CONFIG[app.status];

  return (
    <PageContainer title="Application Detail">
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-4 py-3 shadow-xl text-sm font-medium",
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          )}
        >
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Back */}
      <Link
        href="/hr-management/applications"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Applications
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── Left: Candidate Info ── */}
        <div className="space-y-5">
          {/* Header card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-600 text-2xl font-bold text-white">
                {profile?.avatar && profile.avatar.startsWith("http") ? (
                  <img src={profile.avatar} alt={app.fullName} className="h-full w-full object-cover" />
                ) : (
                  getInitials(app.fullName)
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-xl font-bold text-zinc-900">{app.fullName}</h1>
                {profile?.title && <p className="mt-0.5 text-sm font-medium text-blue-600">{profile.title}</p>}
                <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-sm text-zinc-500 sm:justify-start">
                  <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-zinc-400" />{app.email}</span>
                  {(app.phone || profile?.phone) && (
                    <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-zinc-400" />{app.phone ?? profile?.phone}</span>
                  )}
                  {profile?.location && (
                    <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-zinc-400" />{profile.location}</span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap justify-center gap-3 sm:justify-start">
                  {profile?.linkedinUrl && (
                    <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
                      <ExternalLink className="h-3 w-3" /> LinkedIn
                    </a>
                  )}
                  {profile?.portfolioUrl && (
                    <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
                      <Globe className="h-3 w-3" /> Portfolio
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <SectionCard title="About" icon={AlertCircle}>
              <p className="text-sm leading-relaxed text-zinc-600">{profile.bio}</p>
            </SectionCard>
          )}

          {/* Cover Letter */}
          {app.coverLetter && (
            <SectionCard title="Cover Letter" icon={FileText}>
              <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-600">{app.coverLetter}</p>
            </SectionCard>
          )}

          {/* Skills */}
          {profile?.skills && profile.skills.length > 0 && (
            <SectionCard title="Skills" icon={CheckCircle2}>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span key={skill} className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
                    {skill}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Work Experience */}
          {profile?.workExperience && profile.workExperience.length > 0 && (
            <SectionCard title="Work Experience" icon={Briefcase}>
              <div className="space-y-4">
                {profile.workExperience.map((exp, i) => (
                  <div key={exp.id} className={cn("relative pl-5", i < profile.workExperience.length - 1 && "pb-4")}>
                    {i < profile.workExperience.length - 1 && (
                      <div className="absolute left-[5px] top-4 h-full w-px bg-zinc-200" />
                    )}
                    <div className="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-blue-600 bg-white" />
                    <p className="font-semibold text-zinc-900">{exp.role}</p>
                    <p className="text-sm font-medium text-blue-600">{exp.company}</p>
                    <p className="text-xs text-zinc-400">
                      {exp.startDate}{exp.startDate && " — "}{exp.current ? "Present" : exp.endDate}
                      {exp.current && <span className="ml-2 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">Current</span>}
                    </p>
                    {exp.description && <p className="mt-1 text-sm text-zinc-500">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Education */}
          {profile?.education && profile.education.length > 0 && (
            <SectionCard title="Education" icon={GraduationCap}>
              <div className="space-y-3">
                {profile.education.map((edu) => (
                  <div key={edu.id} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                    <p className="font-semibold text-zinc-900">{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</p>
                    <p className="text-sm font-medium text-blue-600">{edu.institution}</p>
                    <p className="text-xs text-zinc-400">
                      {edu.startYear}{edu.startYear && " — "}{edu.current ? "Present" : edu.endYear}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        {/* ── Right: Sidebar ── */}
        <div className="space-y-5">
          {/* Application Status */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-zinc-900">Application Status</h3>
            <div className="mb-4">
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ring-1", cfg.color)}>
                <span className={cn("h-2 w-2 rounded-full", cfg.dot)} />
                {cfg.label}
              </span>
            </div>
            <p className="mb-2 text-xs font-medium text-zinc-400">Move to:</p>
            <div className="flex flex-col gap-2">
              {ALL_STATUSES.filter((s) => s !== app.status).map((s) => {
                const c = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    disabled={updating}
                    onClick={() => handleStatusChange(s)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition hover:shadow-sm disabled:opacity-50",
                      "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-white"
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full", c.dot)} />
                    {c.label}
                    {updating && <Loader2 className="ml-auto h-3 w-3 animate-spin text-zinc-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job Info */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-zinc-900">Job Applied For</h3>
            <p className="font-semibold text-zinc-900">{app.job.title}</p>
            {app.job.department && <p className="text-xs text-zinc-400">{app.job.department}</p>}
            {app.job.location && (
              <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                <MapPin className="h-3 w-3" /> {app.job.location}
              </p>
            )}
            <Link
              href={`/hr-management/jobs`}
              className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> View Job Listing
            </Link>
          </div>

          {/* Resume */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-zinc-900">Resume / CV</h3>
            {app.resumeUrl || profile?.resumeUrl ? (
              <a
                href={app.resumeUrl ?? profile?.resumeUrl ?? ""}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-800">resume.pdf</p>
                  <p className="text-xs text-blue-600">Click to view</p>
                </div>
              </a>
            ) : (
              <p className="text-sm italic text-zinc-400">No resume uploaded.</p>
            )}
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-zinc-900">Timeline</h3>
            <p className="text-xs text-zinc-500">
              Applied on{" "}
              <span className="font-medium text-zinc-700">
                {new Date(app.createdAt).toLocaleDateString("en-PK", {
                  weekday: "short", year: "numeric", month: "short", day: "numeric",
                })}
              </span>
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
