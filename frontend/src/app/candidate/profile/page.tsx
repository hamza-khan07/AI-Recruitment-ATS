"use client";

import { useEffect, useState, useCallback } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Globe,
  Pencil,
  Plus,
  Upload,
  CheckCircle2,
  X,
  Briefcase,
  GraduationCap,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface WorkExp {
  id?: string;
  role: string;
  company: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

interface Education {
  id?: string;
  degree: string;
  field?: string;
  institution: string;
  startYear?: string;
  endYear?: string;
  current?: boolean;
}

interface Profile {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  resumeUrl: string;
  avatar: string;
  skills: string[];
  workExperience: WorkExp[];
  education: Education[];
}

// ─── Toast Component ────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl text-sm font-medium animate-in slide-in-from-right-4 fade-in duration-300 min-w-[260px]",
            t.type === "success" && "bg-green-600 text-white",
            t.type === "error" && "bg-red-600 text-white",
            t.type === "info" && "bg-blue-600 text-white"
          )}
        >
          {t.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
          {t.type === "error" && <AlertCircle className="h-4 w-4 shrink-0" />}
          {t.type === "info" && <Loader2 className="h-4 w-4 shrink-0 animate-spin" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)} className="ml-1 opacity-70 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Skill Colors ───────────────────────────────────────────────────────────────

const SKILL_COLORS = [
  "bg-blue-50 text-blue-700 ring-blue-100",
  "bg-purple-50 text-purple-700 ring-purple-100",
  "bg-green-50 text-green-700 ring-green-100",
  "bg-amber-50 text-amber-700 ring-amber-100",
  "bg-pink-50 text-pink-700 ring-pink-100",
  "bg-indigo-50 text-indigo-700 ring-indigo-100",
];

// ─── Initial State ──────────────────────────────────────────────────────────────

const EMPTY_PROFILE: Profile = {
  name: "",
  title: "",
  bio: "",
  email: "",
  phone: "",
  location: "",
  linkedinUrl: "",
  portfolioUrl: "",
  resumeUrl: "",
  avatar: "",
  skills: [],
  workExperience: [],
  education: [],
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

/** Strip nulls from the DB so the form never sees null values */
function normalizeProfile(raw: any, fallback: Partial<Profile> = {}): Profile {
  const str = (v: any) => (v == null ? "" : String(v));
  return {
    name: str(raw?.user?.name ?? raw?.name ?? fallback.name),
    email: str(raw?.user?.email ?? raw?.email ?? fallback.email),
    title: str(raw?.title ?? ""),
    bio: str(raw?.bio ?? ""),
    phone: str(raw?.phone ?? ""),
    location: str(raw?.location ?? ""),
    linkedinUrl: str(raw?.linkedinUrl ?? ""),
    portfolioUrl: str(raw?.portfolioUrl ?? ""),
    resumeUrl: str(raw?.resumeUrl ?? ""),
    avatar:
      raw?.avatar ??
      (raw?.user?.name
        ? raw.user.name[0].toUpperCase()
        : fallback.name
        ? (fallback.name as string)[0]?.toUpperCase() ?? "U"
        : "U"),
    skills: Array.isArray(raw?.skills) ? raw.skills : [],
    workExperience: Array.isArray(raw?.workExperience) ? raw.workExperience : [],
    education: Array.isArray(raw?.education) ? raw.education : [],
  };
}

/** Build a clean payload the backend validator accepts (no nulls, no extra fields) */
function buildPayload(p: Profile) {
  return {
    title: p.title || null,
    bio: p.bio || null,
    phone: p.phone || null,
    location: p.location || null,
    linkedinUrl: p.linkedinUrl || null,
    portfolioUrl: p.portfolioUrl || null,
    resumeUrl: p.resumeUrl || null,
    avatar: p.avatar || null,
    skills: p.skills,
    name: p.name || null,
    email: p.email || null,
    workExperience: p.workExperience.map(({ id: _id, ...w }) => ({
      role: w.role,
      company: w.company,
      startDate: w.startDate || null,
      endDate: w.endDate || null,
      current: !!w.current,
      description: w.description || null,
    })),
    education: p.education.map(({ id: _id, ...e }) => ({
      degree: e.degree,
      field: e.field || null,
      institution: e.institution,
      startYear: e.startYear || null,
      endYear: e.endYear || null,
      current: !!e.current,
    })),
  };
}

// ─── Page Component ─────────────────────────────────────────────────────────────

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [editForm, setEditForm] = useState<Profile>(EMPTY_PROFILE);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // section being saved
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ── Toast helpers ──────────────────────────────────────────────────────────

  const addToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/api/v1/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data?.url;
  };

  // ── Fetch profile ──────────────────────────────────────────────────────────

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/candidates/profile");
      const raw = res.data?.data;
      if (raw) {
        const p = normalizeProfile(raw);
        setProfile(p);
        setEditForm(p);
      } else {
        // No profile yet — pre-fill from auth session
        const authRaw =
          typeof window !== "undefined" ? localStorage.getItem("auth_session") : null;
        const authData = authRaw ? JSON.parse(authRaw) : null;
        const basic = normalizeProfile({}, {
          name: authData?.user?.name ?? "",
          email: authData?.user?.email ?? "",
        });
        // Pre-fill name/email from auth
        basic.name = authData?.user?.name ?? "";
        basic.email = authData?.user?.email ?? "";
        basic.avatar = basic.name ? basic.name[0].toUpperCase() : "U";
        setProfile(basic);
        setEditForm(basic);
        // Auto-open basic edit for new users
        setEditingSection("basic");
      }
    } catch {
      addToast("error", "Failed to load profile. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ── Save profile ───────────────────────────────────────────────────────────

  const saveProfile = useCallback(
    async (updatedProfile: Profile, section: string) => {
      setSaving(section);
      try {
        const payload = buildPayload(updatedProfile);
        const res = await api.post("/api/v1/candidates/profile", payload);
        const saved = res.data?.data;
        // Re-normalise with the server response so IDs are correct
        const refreshed = saved
          ? normalizeProfile(saved, { name: updatedProfile.name, email: updatedProfile.email })
          : updatedProfile;
        setProfile(refreshed);
        setEditForm(refreshed);
        setEditingSection(null);
        addToast("success", "Profile saved successfully! ✓");
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          "Failed to save profile. Please try again.";
        addToast("error", msg);
      } finally {
        setSaving(null);
      }
    },
    [addToast]
  );

  // ── Completion score ───────────────────────────────────────────────────────

  const completion = (() => {
    let s = 0;
    if (profile.name) s += 15;
    if (profile.title) s += 10;
    if (profile.bio) s += 10;
    if (profile.phone) s += 10;
    if (profile.location) s += 10;
    if (profile.skills.length > 0) s += 15;
    if (profile.workExperience.length > 0) s += 15;
    if (profile.education.length > 0) s += 10;
    if (profile.resumeUrl) s += 5;
    return Math.min(s, 100);
  })();

  const completionColor =
    completion >= 80 ? "bg-green-500" : completion >= 50 ? "bg-amber-500" : "bg-blue-600";

  // ── Save basic info ────────────────────────────────────────────────────────

  const ensureUrl = (url: string) => {
    if (!url) return url;
    if (!/^https?:\/\//i.test(url)) return `https://${url}`;
    return url;
  };

  const handleSaveBasicInfo = () => {
    const updated: Profile = {
      ...profile,
      name: editForm.name,
      email: editForm.email,
      title: editForm.title,
      bio: editForm.bio,
      phone: editForm.phone,
      location: editForm.location,
      linkedinUrl: ensureUrl(editForm.linkedinUrl),
      portfolioUrl: ensureUrl(editForm.portfolioUrl),
    };
    saveProfile(updated, "basic");
  };

  // ── Skills ─────────────────────────────────────────────────────────────────

  const addSkill = () => {
    const skill = newSkill.trim();
    if (!skill) return;
    if (profile.skills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())) {
      addToast("error", `"${skill}" is already in your skills list.`);
      return;
    }
    const updated = { ...profile, skills: [...profile.skills, skill] };
    saveProfile(updated, "skills");
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    const updated = { ...profile, skills: profile.skills.filter((s) => s !== skill) };
    saveProfile(updated, "skills");
  };

  // ── Experience form state ──────────────────────────────────────────────────

  const [expForm, setExpForm] = useState({ role: "", company: "", startDate: "", endDate: "", description: "", current: false });
  const [expError, setExpError] = useState("");

  const saveExperience = () => {
    if (!expForm.role.trim() || !expForm.company.trim()) {
      setExpError("Role and Company are required.");
      return;
    }
    setExpError("");
    const newExp: WorkExp = {
      role: expForm.role.trim(),
      company: expForm.company.trim(),
      startDate: expForm.startDate || undefined,
      endDate: expForm.current ? undefined : expForm.endDate || undefined,
      current: expForm.current,
      description: expForm.description || undefined,
    };
    const updated = { ...profile, workExperience: [...profile.workExperience, newExp] };
    saveProfile(updated, "exp");
    setExpForm({ role: "", company: "", startDate: "", endDate: "", description: "", current: false });
  };

  // ── Education form state ───────────────────────────────────────────────────

  const [eduForm, setEduForm] = useState({ degree: "", field: "", institution: "", startYear: "", endYear: "", current: false });
  const [eduError, setEduError] = useState("");

  const saveEducation = () => {
    if (!eduForm.degree.trim() || !eduForm.institution.trim()) {
      setEduError("Degree and Institution are required.");
      return;
    }
    setEduError("");
    const newEdu: Education = {
      degree: eduForm.degree.trim(),
      field: eduForm.field || undefined,
      institution: eduForm.institution.trim(),
      startYear: eduForm.startYear || undefined,
      endYear: eduForm.current ? undefined : eduForm.endYear || undefined,
      current: eduForm.current,
    };
    const updated = { ...profile, education: [...profile.education, newEdu] };
    saveProfile(updated, "edu");
    setEduForm({ degree: "", field: "", institution: "", startYear: "", endYear: "", current: false });
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 animate-pulse">
        <div className="h-64 rounded-2xl bg-zinc-100" />
        <div className="h-40 rounded-2xl bg-zinc-100" />
        <div className="h-40 rounded-2xl bg-zinc-100" />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <ToastContainer toasts={toasts} remove={removeToast} />

      <div className="mx-auto max-w-4xl space-y-6">
        {/* ── Profile Header ──────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="px-6 py-8">
            <div className="flex flex-col items-center gap-4">
              {/* Avatar */}
              <div className="relative group">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-slate-100 bg-blue-600 text-3xl font-bold text-white shadow-lg select-none overflow-hidden">
                  {profile.avatar && profile.avatar.startsWith("http") ? (
                    <img src={profile.avatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    profile.avatar || (profile.name ? profile.name[0].toUpperCase() : "U")
                  )}
                </div>
                <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-2xl bg-black/50 text-white opacity-0 transition group-hover:opacity-100">
                  <Upload className="h-6 w-6" />
                  <span className="text-[10px] font-medium mt-1">Upload</span>
                  <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      addToast("info", "Uploading avatar...");
                      try {
                        const url = await uploadFile(file);
                        saveProfile({ ...profile, avatar: url }, "avatar");
                      } catch {
                        addToast("error", "Failed to upload avatar");
                      }
                    }
                  }} />
                </label>
              </div>

              {/* Edit button */}
              <button
                onClick={() => {
                  setEditForm({ ...profile });
                  setEditingSection(editingSection === "basic" ? null : "basic");
                }}
                disabled={saving === "basic"}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
              >
                <Pencil className="h-4 w-4" />
                {editingSection === "basic" ? "Cancel Editing" : "Edit Profile"}
              </button>
            </div>

            {editingSection === "basic" ? (
              <div className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: "Full Name", key: "name", type: "text", readOnly: false },
                    { label: "Job Title / Headline", key: "title", type: "text" },
                    { label: "Email", key: "email", type: "email", readOnly: false },
                    { label: "Phone", key: "phone", type: "tel" },
                    { label: "Location", key: "location", type: "text" },
                    { label: "LinkedIn URL", key: "linkedinUrl", type: "url" },
                    { label: "Portfolio URL", key: "portfolioUrl", type: "url" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                        {field.label}
                        {field.readOnly && (
                          <span className="ml-1.5 text-[10px] font-normal text-zinc-400">(auto-filled)</span>
                        )}
                      </label>
                      <input
                        type={field.type}
                        value={(editForm as any)[field.key] ?? ""}
                        readOnly={field.readOnly}
                        onChange={(e) =>
                          !field.readOnly &&
                          setEditForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        className={cn(
                          "w-full rounded-xl border px-3 py-2 text-sm text-zinc-900 outline-none transition",
                          field.readOnly
                            ? "border-zinc-100 bg-zinc-50 text-zinc-400 cursor-not-allowed"
                            : "border-zinc-200 bg-zinc-50 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        )}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500">Bio</label>
                  <textarea
                    value={editForm.bio ?? ""}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    placeholder="Tell employers a bit about yourself…"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveBasicInfo}
                    disabled={saving === "basic"}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
                  >
                    {saving === "basic" ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4" /> Save Changes</>
                    )}
                  </button>
                  <button
                    onClick={() => setEditingSection(null)}
                    className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold text-zinc-900">
                  {profile.name || <span className="text-zinc-400 italic">Add your name</span>}
                </h1>
                <p className="mt-0.5 text-base font-medium text-blue-600">
                  {profile.title || (
                    <span className="text-zinc-400 italic text-sm">Add a job title</span>
                  )}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500 max-w-2xl mx-auto">
                  {profile.bio || (
                    <span className="text-zinc-400 italic">
                      Add a bio to tell employers about yourself
                    </span>
                  )}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-zinc-500">
                  {profile.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-4 w-4 text-zinc-400" />
                      {profile.email}
                    </span>
                  )}
                  {profile.phone ? (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4 text-zinc-400" />
                      {profile.phone}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-zinc-300 italic text-xs">
                      <Phone className="h-3.5 w-3.5" /> Add phone
                    </span>
                  )}
                  {profile.location ? (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-zinc-400" />
                      {profile.location}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-zinc-300 italic text-xs">
                      <MapPin className="h-3.5 w-3.5" /> Add location
                    </span>
                  )}
                  {profile.linkedinUrl && (
                    <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline">
                      <ExternalLink className="h-4 w-4" /> LinkedIn
                    </a>
                  )}
                  {profile.portfolioUrl && (
                    <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline">
                      <Globe className="h-4 w-4" /> Portfolio
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile completion bar */}
          <div className="border-t border-zinc-100 px-6 py-3">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
              <span className="font-medium">Profile Completion</span>
              <span className={cn("font-bold", completion >= 80 ? "text-green-600" : completion >= 50 ? "text-amber-500" : "text-blue-600")}>
                {completion}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className={cn("h-2 rounded-full transition-all duration-700", completionColor)}
                style={{ width: `${completion}%` }}
              />
            </div>
            {completion < 100 && (
              <p className="mt-1.5 text-[11px] text-zinc-400">
                {completion === 0
                  ? "Start filling in your profile to attract employers."
                  : completion < 50
                  ? "Good start! Add more details to stand out."
                  : "Almost there! Complete your profile for best results."}
              </p>
            )}
          </div>
        </div>

        {/* ── Resume ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
              <FileText className="h-5 w-5 text-blue-500" />
              Resume / CV
            </h2>
          </div>
          {profile.resumeUrl ? (
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-800">resume.pdf</p>
                  <p className="text-xs text-zinc-400">Uploaded</p>
                </div>
              </div>
              <label className="cursor-pointer text-xs font-medium text-blue-600 hover:underline">
                Replace
                <input type="file" className="hidden" accept=".pdf" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    addToast("info", "Uploading resume...");
                    try {
                      const url = await uploadFile(file);
                      saveProfile({ ...profile, resumeUrl: url }, "resume");
                    } catch {
                      addToast("error", "Failed to upload resume");
                    }
                  }
                }} />
              </label>
            </div>
          ) : (
            <label className="cursor-pointer block rounded-2xl border-2 border-dashed border-zinc-200 px-6 py-10 text-center transition hover:border-blue-300 hover:bg-blue-50/30">
              <Upload className="mx-auto h-8 w-8 text-zinc-300" />
              <p className="mt-2 text-sm font-medium text-zinc-500">
                <span className="text-blue-600">Upload your resume</span> or browse
              </p>
              <p className="mt-1 text-xs text-zinc-400">PDF up to 5MB</p>
              <input type="file" className="hidden" accept=".pdf" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  addToast("info", "Uploading resume...");
                  try {
                    const url = await uploadFile(file);
                    saveProfile({ ...profile, resumeUrl: url }, "resume");
                  } catch {
                    addToast("error", "Failed to upload resume");
                  }
                }
              }} />
            </label>
          )}
        </div>

        {/* ── Skills ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-zinc-900">
            <User className="h-5 w-5 text-blue-500" />
            Skills
          </h2>
          <div className="flex flex-wrap gap-2 min-h-[32px]">
            {profile.skills.length === 0 && (
              <p className="text-sm text-zinc-400 italic">No skills added yet. Add your first skill below.</p>
            )}
            {profile.skills.map((skill, i) => (
              <span
                key={skill}
                className={cn(
                  "group inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ring-1",
                  SKILL_COLORS[i % SKILL_COLORS.length]
                )}
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  disabled={saving === "skills"}
                  className="opacity-0 transition group-hover:opacity-100 disabled:cursor-not-allowed"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              placeholder="Type a skill and press Enter (e.g. TypeScript)"
              className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            <button
              onClick={addSkill}
              disabled={saving === "skills" || !newSkill.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving === "skills" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </button>
          </div>
        </div>

        {/* ── Work Experience ──────────────────────────────────────────── */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
              <Briefcase className="h-5 w-5 text-blue-500" />
              Work Experience
            </h2>
            <button
              onClick={() => {
                setExpError("");
                setExpForm({ role: "", company: "", startDate: "", endDate: "", description: "", current: false });
                setEditingSection(editingSection === "exp" ? null : "exp");
              }}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {editingSection === "exp" ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {editingSection === "exp" ? "Cancel" : "Add"}
            </button>
          </div>

          {editingSection === "exp" && (
            <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
              <h3 className="mb-3 text-sm font-bold text-zinc-800">Add Experience</h3>
              {expError && (
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" /> {expError}
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">Role <span className="text-red-400">*</span></label>
                  <input type="text" placeholder="e.g. Frontend Developer" value={expForm.role} onChange={(e) => setExpForm((p) => ({ ...p, role: e.target.value }))} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">Company <span className="text-red-400">*</span></label>
                  <input type="text" placeholder="e.g. Google" value={expForm.company} onChange={(e) => setExpForm((p) => ({ ...p, company: e.target.value }))} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">Start Date</label>
                  <input type="text" placeholder="e.g. Jan 2021" value={expForm.startDate} onChange={(e) => setExpForm((p) => ({ ...p, startDate: e.target.value }))} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">End Date</label>
                  <input type="text" placeholder="e.g. Dec 2023" value={expForm.endDate} disabled={expForm.current} onChange={(e) => setExpForm((p) => ({ ...p, endDate: e.target.value }))} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-zinc-100 disabled:text-zinc-400" />
                  <label className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer">
                    <input type="checkbox" checked={expForm.current} onChange={(e) => setExpForm((p) => ({ ...p, current: e.target.checked, endDate: e.target.checked ? "" : p.endDate }))} className="accent-blue-600" />
                    Currently working here
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-500">Description</label>
                  <textarea placeholder="Describe your responsibilities…" value={expForm.description} onChange={(e) => setExpForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm resize-none focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="sm:col-span-2">
                  <button onClick={saveExperience} disabled={saving === "exp"} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
                    {saving === "exp" ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><CheckCircle2 className="h-4 w-4" /> Save Experience</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-5">
            {profile.workExperience.length === 0 && (
              <p className="text-sm text-zinc-400 italic text-center py-4">No work experience added yet.</p>
            )}
            {profile.workExperience.map((exp, i) => (
              <div key={exp.id || i} className={cn("relative pl-6", i < profile.workExperience.length - 1 && "pb-5")}>
                {i < profile.workExperience.length - 1 && (
                  <div className="absolute left-[7px] top-5 h-full w-px bg-zinc-200" />
                )}
                <div className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-blue-600 bg-white" />
                <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-zinc-900">{exp.role}</p>
                      <p className="text-sm font-medium text-blue-600">{exp.company}</p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {exp.startDate} {exp.startDate && "—"} {exp.current ? "Present" : exp.endDate}
                        {exp.current && (
                          <span className="ml-2 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">Current</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => saveProfile({ ...profile, workExperience: profile.workExperience.filter((_, idx) => idx !== i) }, "exp")}
                      disabled={saving === "exp"}
                      className="text-xs text-red-500 hover:underline disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                  {exp.description && <p className="mt-2 text-sm text-zinc-500">{exp.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Education ────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
              <GraduationCap className="h-5 w-5 text-blue-500" />
              Education
            </h2>
            <button
              onClick={() => {
                setEduError("");
                setEduForm({ degree: "", field: "", institution: "", startYear: "", endYear: "", current: false });
                setEditingSection(editingSection === "edu" ? null : "edu");
              }}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {editingSection === "edu" ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {editingSection === "edu" ? "Cancel" : "Add"}
            </button>
          </div>

          {editingSection === "edu" && (
            <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
              <h3 className="mb-3 text-sm font-bold text-zinc-800">Add Education</h3>
              {eduError && (
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" /> {eduError}
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">Degree <span className="text-red-400">*</span></label>
                  <input type="text" placeholder="e.g. BS" value={eduForm.degree} onChange={(e) => setEduForm((p) => ({ ...p, degree: e.target.value }))} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">Field of Study</label>
                  <input type="text" placeholder="e.g. Computer Science" value={eduForm.field} onChange={(e) => setEduForm((p) => ({ ...p, field: e.target.value }))} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-zinc-500">Institution <span className="text-red-400">*</span></label>
                  <input type="text" placeholder="e.g. COMSATS University" value={eduForm.institution} onChange={(e) => setEduForm((p) => ({ ...p, institution: e.target.value }))} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">Start Year</label>
                  <input type="text" placeholder="e.g. 2020" value={eduForm.startYear} onChange={(e) => setEduForm((p) => ({ ...p, startYear: e.target.value }))} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">End Year</label>
                  <input type="text" placeholder="e.g. 2024" value={eduForm.endYear} disabled={eduForm.current} onChange={(e) => setEduForm((p) => ({ ...p, endYear: e.target.value }))} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-zinc-100 disabled:text-zinc-400" />
                  <label className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer">
                    <input type="checkbox" checked={eduForm.current} onChange={(e) => setEduForm((p) => ({ ...p, current: e.target.checked, endYear: e.target.checked ? "" : p.endYear }))} className="accent-blue-600" />
                    Currently studying here
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <button onClick={saveEducation} disabled={saving === "edu"} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
                    {saving === "edu" ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><CheckCircle2 className="h-4 w-4" /> Save Education</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {profile.education.length === 0 && (
              <p className="text-sm text-zinc-400 italic text-center py-4">No education added yet.</p>
            )}
            {profile.education.map((edu, i) => (
              <div key={edu.id || i} className="flex items-start justify-between gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900">
                      {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                    </p>
                    <p className="text-sm font-medium text-blue-600">{edu.institution}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {edu.startYear} {edu.startYear && "—"} {edu.current ? "Present" : edu.endYear}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => saveProfile({ ...profile, education: profile.education.filter((_, idx) => idx !== i) }, "edu")}
                  disabled={saving === "edu"}
                  className="text-xs text-red-500 hover:underline disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
