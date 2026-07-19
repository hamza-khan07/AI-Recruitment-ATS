"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import api from "@/lib/api";

const jobFormSchema = z.object({
  title: z.string().min(2, "Job title must be at least 2 characters"),
  department: z.string().optional(),
  employmentType: z.string().optional(),
  workMode: z.string().optional(),
  location: z.string().optional(),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  experience: z.string().optional(),
  openPositions: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  qualifications: z.string().optional(),
  skills: z.string().optional(),
  benefits: z.string().optional(),
  deadline: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"]).optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

// ─── AI Field Types ───────────────────────────────────────────────────────────
type AIField =
  | "description"
  | "responsibilities"
  | "requirements"
  | "qualifications"
  | "skills"
  | "benefits";

// ─── AI Generate Button Component ─────────────────────────────────────────────
// A small reusable button that shows a spinner while AI is generating
function AIButton({
  field,
  onClick,
  isGenerating,
}: {
  field: AIField;
  onClick: (field: AIField) => void;
  isGenerating: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(field)}
      disabled={isGenerating}
      className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:from-violet-600 hover:to-indigo-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isGenerating ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Sparkles className="h-3.5 w-3.5" />
      )}
      {isGenerating ? "Generating…" : "Generate with AI"}
    </button>
  );
}

export default function JobForm({ initial = {}, onSubmit }: { initial?: any; onSubmit: (data: any) => Promise<void> }) {
  const [submitting, setSubmitting] = useState(false);
  // Track which field is currently being generated (null means none)
  const [generatingField, setGeneratingField] = useState<AIField | null>(null);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: initial.title || "",
      department: initial.department || "",
      employmentType: initial.employmentType || "",
      workMode: initial.workMode || "",
      location: initial.location || "",
      salaryMin: initial.salaryMin?.toString() || "",
      salaryMax: initial.salaryMax?.toString() || "",
      experience: initial.experience || "",
      openPositions: initial.openPositions?.toString() || "1",
      description: initial.description || "",
      responsibilities: initial.responsibilities || "",
      requirements: initial.requirements || "",
      qualifications: initial.qualifications || "",
      skills: initial.skills || "",
      benefits: initial.benefits || "",
      deadline: initial.deadline ? new Date(initial.deadline).toISOString().split('T')[0] : "",
      status: initial.status || "DRAFT",
    },
  });

  // ─── AI Generation Logic ────────────────────────────────────────────────────
  // This function is called when any "Generate with AI" button is clicked.
  // 
  // HOW IT WORKS:
  // 1. We read the CURRENT form values (title, dept, etc.) as "context"
  // 2. We call our backend API POST /api/v1/ai/generate-job-content
  // 3. Backend sends those to Gemini API with a tailored prompt
  // 4. We receive the generated text and fill it into the correct form field
  const generateWithAI = async (field: AIField) => {
    // Step 1: Validate that title is filled - it's the most important context
    const currentValues = form.getValues();
    if (!currentValues.title || currentValues.title.trim().length < 2) {
      toast.error("Please enter a Job Title first before generating AI content.");
      return;
    }

    setGeneratingField(field);

    try {
      // Step 2: Build the context object from current form values
      // This is what Gemini will use to understand what kind of job this is
      const context = {
        title: currentValues.title,
        department: currentValues.department,
        employmentType: currentValues.employmentType,
        workMode: currentValues.workMode,
        experience: currentValues.experience,
        location: currentValues.location,
      };

      // Step 3: Call our backend API
      // The backend will build the right prompt and call Gemini
      const { data } = await api.post("/api/v1/ai/generate-job-content", {
        field,   // e.g. "description", "skills", etc.
        context, // All the job details
      });

      if (data.success) {
        // Step 4: Fill the generated text into the correct form field
        // form.setValue() programmatically updates a field's value
        form.setValue(field, data.data.text, { shouldValidate: true });
        toast.success(`AI generated ${field} successfully!`);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to generate content. Please try again.";
      toast.error(msg);
    } finally {
      setGeneratingField(null);
    }
  };

  const submitJob = async (values: JobFormValues, forcedStatus?: string) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        salaryMin: values.salaryMin ? parseInt(values.salaryMin, 10) : undefined,
        salaryMax: values.salaryMax ? parseInt(values.salaryMax, 10) : undefined,
        openPositions: parseInt(values.openPositions || "1", 10),
        deadline: values.deadline ? new Date(values.deadline).toISOString() : undefined,
        status: forcedStatus || values.status || "DRAFT",
      };
      await onSubmit(payload);
      toast.success(initial.id ? "Job updated successfully!" : "Job created successfully!");
    } catch (error: any) {
      const backendMsg = error?.response?.data?.message;
      toast.error(backendMsg || "An error occurred while saving the job.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const publishJob = async () => {
    form.handleSubmit((values) => submitJob(values, "PUBLISHED"))();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => submitJob(values))} className="space-y-8">
        
        {/* Basic Information Section */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold leading-none tracking-tight">Basic Information</h3>
            <p className="text-sm text-zinc-500">Fundamental details about the job posting.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Job Title *</FormLabel>
                <FormControl><Input placeholder="e.g. Senior Frontend Engineer" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="department" render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl><Input placeholder="e.g. Engineering" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="employmentType" render={({ field }) => (
              <FormItem>
                <FormLabel>Employment Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="workMode" render={({ field }) => (
              <FormItem>
                <FormLabel>Work Mode</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select work mode" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="On-site">On-site</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl><Input placeholder="e.g. San Francisco, CA" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* Job Information Section */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold leading-none tracking-tight">Job Information</h3>
            <p className="text-sm text-zinc-500">Details regarding compensation and requirements.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField control={form.control} name="salaryMin" render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Salary (USD)</FormLabel>
                <FormControl><Input type="number" placeholder="e.g. 100000" {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="salaryMax" render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Salary (USD)</FormLabel>
                <FormControl><Input type="number" placeholder="e.g. 150000" {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="experience" render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Required</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select experience level" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Entry-level">Entry-level</SelectItem>
                    <SelectItem value="Mid-level">Mid-level</SelectItem>
                    <SelectItem value="Senior-level">Senior-level</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Director">Director</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="openPositions" render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Openings</FormLabel>
                <FormControl><Input type="number" min="1" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="deadline" render={({ field }) => (
              <FormItem>
                <FormLabel>Application Deadline</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* Description & Responsibilities Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold leading-none tracking-tight">Role Description</h3>
                <p className="text-sm text-zinc-500 mt-1">Describe what the candidate will do.</p>
              </div>
              {/* One button to generate ALL text fields at once */}
              <button
                type="button"
                onClick={async () => {
                  const currentValues = form.getValues();
                  if (!currentValues.title || currentValues.title.trim().length < 2) {
                    toast.error("Please enter a Job Title first.");
                    return;
                  }
                  toast.info("Generating all fields with AI… This may take a moment.");
                  const fields: AIField[] = ["description", "responsibilities", "requirements", "qualifications", "skills", "benefits"];
                  for (const f of fields) {
                    await generateWithAI(f);
                  }
                }}
                disabled={!!generatingField}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:from-violet-700 hover:to-indigo-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generatingField ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {generatingField ? "AI Writing…" : "✨ Generate All with AI"}
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Job Description *</FormLabel>
                  <AIButton
                    field="description"
                    onClick={generateWithAI}
                    isGenerating={generatingField === "description"}
                  />
                </div>
                <FormControl><Textarea placeholder="Enter full job description or click 'Generate with AI'…" className="min-h-[150px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="responsibilities" render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Responsibilities</FormLabel>
                  <AIButton
                    field="responsibilities"
                    onClick={generateWithAI}
                    isGenerating={generatingField === "responsibilities"}
                  />
                </div>
                <FormControl><Textarea placeholder="List the key responsibilities or click 'Generate with AI'…" className="min-h-[120px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* Requirements & Skills Section */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold leading-none tracking-tight">Requirements & Skills</h3>
            <p className="text-sm text-zinc-500">What is expected from the candidate.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="requirements" render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Requirements</FormLabel>
                  <AIButton
                    field="requirements"
                    onClick={generateWithAI}
                    isGenerating={generatingField === "requirements"}
                  />
                </div>
                <FormControl><Textarea placeholder="List the requirements or click 'Generate with AI'…" className="min-h-[120px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="qualifications" render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Qualifications</FormLabel>
                  <AIButton
                    field="qualifications"
                    onClick={generateWithAI}
                    isGenerating={generatingField === "qualifications"}
                  />
                </div>
                <FormControl><Textarea placeholder="List educational and other qualifications or click 'Generate with AI'…" className="min-h-[120px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="skills" render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Required Skills (comma-separated)</FormLabel>
                  <AIButton
                    field="skills"
                    onClick={generateWithAI}
                    isGenerating={generatingField === "skills"}
                  />
                </div>
                <FormControl><Input placeholder="e.g. React, Node.js, TypeScript — or click 'Generate with AI'" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>
        
        {/* Benefits Section */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold leading-none tracking-tight">Benefits</h3>
            <p className="text-sm text-zinc-500">What the company offers.</p>
          </CardHeader>
          <CardContent>
            <FormField control={form.control} name="benefits" render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Benefits</FormLabel>
                  <AIButton
                    field="benefits"
                    onClick={generateWithAI}
                    isGenerating={generatingField === "benefits"}
                  />
                </div>
                <FormControl><Textarea placeholder="List the benefits or click 'Generate with AI'…" className="min-h-[120px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 border-t pt-6">
          <Button type="submit" variant="secondary" disabled={submitting}>
            {submitting && form.getValues('status') !== 'PUBLISHED' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save as Draft
          </Button>
          <Button type="button" onClick={publishJob} disabled={submitting}>
            {submitting && form.getValues('status') === 'PUBLISHED' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Publish Job
          </Button>
        </div>

      </form>
    </Form>
  );
}
