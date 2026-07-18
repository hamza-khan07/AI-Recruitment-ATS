"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { X, Upload, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Job } from "@/types/candidate";
import api from "@/lib/api";

interface ApplyModalProps {
  job: Job;
  onClose: () => void;
}

type Step = "form" | "success";

export function ApplyModal({ job, onClose }: ApplyModalProps) {
  const [step, setStep] = useState<Step>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [existingResumeUrl, setExistingResumeUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    coverLetter: "",
  });

  useEffect(() => {
    api.get("/api/v1/candidates/profile").then((res: any) => {
      const p = res.data?.data;
      if (p) {
        setForm((prev) => ({
          ...prev,
          fullName: prev.fullName || p.user?.name || p.name || "",
          email: prev.email || p.user?.email || p.email || "",
          phone: prev.phone || p.phone || "",
        }));
        if (p.resumeUrl) {
          setExistingResumeUrl(p.resumeUrl);
        }
      } else {
        const authRaw = typeof window !== "undefined" ? localStorage.getItem("auth_session") : null;
        if (authRaw) {
          try {
            const authData = JSON.parse(authRaw);
            setForm((prev) => ({
              ...prev,
              fullName: prev.fullName || authData?.user?.name || "",
              email: prev.email || authData?.user?.email || "",
            }));
          } catch {}
        }
      }
    }).catch(() => {});
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) return;
    setResumeFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files?.[0] ?? null);
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const jobId = job.id;
      await api.post(`/api/v1/candidates/jobs/${jobId}/apply`, {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || null,
        resumeUrl: existingResumeUrl || null,
        coverLetter: form.coverLetter || null,
      });
      setStep("success");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to submit application. Please try again.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
        >
          <X className="h-4 w-4" />
        </button>

        {step === "success" ? (
          /* ── Success State ── */
          <div className="flex flex-col items-center gap-4 px-8 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Application Submitted!</h2>
            <p className="text-sm text-zinc-500">
              Your application for{" "}
              <span className="font-semibold text-zinc-800">{job.title}</span> at{" "}
              <span className="font-semibold text-blue-600">{job.company.name}</span>{" "}
              has been sent. We&apos;ll notify you when there&apos;s an update.
            </p>
            <Button onClick={onClose} className="mt-2 rounded-xl bg-blue-600 px-6 hover:bg-blue-700">
              Done
            </Button>
          </div>
        ) : (
          /* ── Apply Form ── */
          <>
            <div className="border-b border-zinc-100 px-6 py-5">
              <h2 className="text-lg font-bold text-zinc-900">Apply for this Job</h2>
              <p className="mt-1 text-sm text-zinc-500">
                {job.title} · {job.company.name}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Ahmad Hassan"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+92 300 0000000"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                    Resume / CV
                  </label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-6 text-center transition-all ${
                      dragOver
                        ? "border-blue-400 bg-blue-50"
                        : resumeFile
                        ? "border-green-300 bg-green-50"
                        : existingResumeUrl
                        ? "border-blue-300 bg-blue-50/50"
                        : "border-zinc-200 bg-zinc-50 hover:border-blue-300 hover:bg-blue-50/40"
                    }`}
                  >
                    {resumeFile ? (
                      <div className="flex flex-col items-center gap-1">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                        <p className="text-sm font-medium text-green-700">{resumeFile.name}</p>
                        <p className="text-xs text-green-500">Click to change file</p>
                      </div>
                    ) : existingResumeUrl ? (
                      <div className="flex flex-col items-center gap-1">
                        <CheckCircle2 className="h-6 w-6 text-blue-500" />
                        <p className="text-sm font-medium text-blue-700">Using Profile Resume</p>
                        <p className="text-xs text-blue-500">Click to upload a different one</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Upload className="h-6 w-6 text-zinc-400" />
                        <p className="text-sm text-zinc-500">
                          <span className="font-medium text-blue-600">Click to upload</span> or drag & drop
                        </p>
                        <p className="text-xs text-zinc-400">PDF, DOC, DOCX (max 5MB)</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                    Cover Letter{" "}
                    <span className="text-zinc-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    name="coverLetter"
                    value={form.coverLetter}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us why you're a great fit for this role..."
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              {submitError && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                  {submitError}
                </div>
              )}
              <div className="mt-5 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.fullName || !form.email}
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
