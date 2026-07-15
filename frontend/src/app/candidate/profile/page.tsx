"use client";

import { useState } from "react";
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
  Check,
  X,
  Briefcase,
  GraduationCap,
  FileText,
} from "lucide-react";
import { MOCK_CANDIDATE_PROFILE } from "@/lib/candidate-mock-data";
import { cn } from "@/lib/utils";

const SKILL_COLORS = [
  "bg-blue-50 text-blue-700 ring-blue-100",
  "bg-purple-50 text-purple-700 ring-purple-100",
  "bg-green-50 text-green-700 ring-green-100",
  "bg-amber-50 text-amber-700 ring-amber-100",
  "bg-pink-50 text-pink-700 ring-pink-100",
  "bg-indigo-50 text-indigo-700 ring-indigo-100",
];

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState(MOCK_CANDIDATE_PROFILE);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [editForm, setEditForm] = useState({ ...profile });

  const profileCompletion = (() => {
    let score = 0;
    if (profile.name) score += 15;
    if (profile.title) score += 10;
    if (profile.bio) score += 10;
    if (profile.phone) score += 10;
    if (profile.location) score += 10;
    if (profile.skills.length > 0) score += 15;
    if (profile.workExperience.length > 0) score += 15;
    if (profile.education.length > 0) score += 10;
    if (profile.resumeUrl) score += 5;
    return Math.min(score, 100);
  })();

  const handleSaveBasicInfo = () => {
    setProfile((prev) => ({
      ...prev,
      name: editForm.name,
      title: editForm.title,
      bio: editForm.bio,
      email: editForm.email,
      phone: editForm.phone,
      location: editForm.location,
      linkedinUrl: editForm.linkedinUrl,
      portfolioUrl: editForm.portfolioUrl,
    }));
    setEditingSection(null);
  };

  const addSkill = () => {
    const skill = newSkill.trim();
    if (!skill || profile.skills.includes(skill)) return;
    setProfile((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* ── Profile Header Card ────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700" />

        <div className="px-6 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between -mt-10">
            {/* Avatar */}
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-blue-600 text-2xl font-bold text-white shadow-lg">
              {profile.avatar}
            </div>

            {/* Edit button */}
            <button
              onClick={() => {
                setEditForm({ ...profile });
                setEditingSection(editingSection === "basic" ? null : "basic");
              }}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <Pencil className="h-4 w-4" />
              {editingSection === "basic" ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {editingSection === "basic" ? (
            /* Edit Form */
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Full Name", key: "name", type: "text" },
                { label: "Job Title", key: "title", type: "text" },
                { label: "Email", key: "email", type: "email" },
                { label: "Phone", key: "phone", type: "text" },
                { label: "Location", key: "location", type: "text" },
                { label: "LinkedIn URL", key: "linkedinUrl", type: "url" },
                { label: "Portfolio URL", key: "portfolioUrl", type: "url" },
              ].map((field) => (
                <div key={field.key} className={field.key === "name" || field.key === "title" ? "" : ""}>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={(editForm as any)[field.key] ?? ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-zinc-500">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </div>
              <div className="flex gap-3 sm:col-span-2">
                <button
                  onClick={handleSaveBasicInfo}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Check className="h-4 w-4" /> Save Changes
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
            /* View Mode */
            <div className="mt-4">
              <h1 className="text-2xl font-bold text-zinc-900">{profile.name}</h1>
              <p className="mt-0.5 text-base font-medium text-blue-600">{profile.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 max-w-2xl">{profile.bio}</p>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-zinc-400" />{profile.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-zinc-400" />{profile.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-zinc-400" />{profile.location}
                </span>
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline">
                    <ExternalLink className="h-4 w-4" />LinkedIn
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline">
                    <Globe className="h-4 w-4" />Portfolio
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
            <span className="font-bold text-blue-600">{profileCompletion}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Resume Upload ────────────────────────────────── */}
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
            <button className="text-xs font-medium text-blue-600 hover:underline">
              Replace
            </button>
          </div>
        ) : (
          <div className="cursor-pointer rounded-2xl border-2 border-dashed border-zinc-200 px-6 py-10 text-center transition hover:border-blue-300 hover:bg-blue-50/30">
            <Upload className="mx-auto h-8 w-8 text-zinc-300" />
            <p className="mt-2 text-sm font-medium text-zinc-500">
              <span className="text-blue-600">Upload your resume</span> or drag & drop
            </p>
            <p className="mt-1 text-xs text-zinc-400">PDF, DOC, DOCX up to 5MB</p>
          </div>
        )}
      </div>

      {/* ── Skills ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-zinc-900">
          <User className="h-5 w-5 text-blue-500" />
          Skills
        </h2>
        <div className="flex flex-wrap gap-2">
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
                className="opacity-0 transition group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        {/* Add skill input */}
        <div className="mt-4 flex gap-2">
          <input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
            placeholder="Add a skill (e.g. TypeScript)"
            className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
          <button
            onClick={addSkill}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      {/* ── Work Experience ──────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
            <Briefcase className="h-5 w-5 text-blue-500" />
            Work Experience
          </h2>
          <button className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>

        <div className="space-y-5">
          {profile.workExperience.map((exp, i) => (
            <div key={exp.id} className={cn("relative pl-6", i < profile.workExperience.length - 1 && "pb-5")}>
              {/* Timeline line */}
              {i < profile.workExperience.length - 1 && (
                <div className="absolute left-[7px] top-5 h-full w-px bg-zinc-200" />
              )}
              {/* Timeline dot */}
              <div className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-blue-600 bg-white" />

              <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-zinc-900">{exp.role}</p>
                    <p className="text-sm font-medium text-blue-600">{exp.company}</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                      {exp.current && (
                        <span className="ml-2 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                          Current
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-zinc-500">{exp.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Education ───────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
            <GraduationCap className="h-5 w-5 text-blue-500" />
            Education
          </h2>
          <button className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>

        <div className="space-y-4">
          {profile.education.map((edu) => (
            <div
              key={edu.id}
              className="flex items-start gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-zinc-900">
                  {edu.degree} in {edu.field}
                </p>
                <p className="text-sm font-medium text-blue-600">{edu.institution}</p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  {edu.startYear} — {edu.current ? "Present" : edu.endYear}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
