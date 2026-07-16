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
import { Loader2 } from "lucide-react";

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

export default function JobForm({ initial = {}, onSubmit }: { initial?: any; onSubmit: (data: any) => Promise<void> }) {
  const [submitting, setSubmitting] = useState(false);

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
            <h3 className="text-lg font-semibold leading-none tracking-tight">Role Description</h3>
            <p className="text-sm text-zinc-500">Describe what the candidate will do.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Job Description *</FormLabel>
                <FormControl><Textarea placeholder="Enter full job description here..." className="min-h-[150px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="responsibilities" render={({ field }) => (
              <FormItem>
                <FormLabel>Responsibilities</FormLabel>
                <FormControl><Textarea placeholder="List the key responsibilities..." className="min-h-[100px]" {...field} /></FormControl>
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
                <FormLabel>Requirements</FormLabel>
                <FormControl><Textarea placeholder="List the requirements..." className="min-h-[100px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="qualifications" render={({ field }) => (
              <FormItem>
                <FormLabel>Qualifications</FormLabel>
                <FormControl><Textarea placeholder="List educational and other qualifications..." className="min-h-[100px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="skills" render={({ field }) => (
              <FormItem>
                <FormLabel>Required Skills (comma-separated)</FormLabel>
                <FormControl><Input placeholder="e.g. React, Node.js, TypeScript" {...field} /></FormControl>
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
                <FormLabel>Benefits</FormLabel>
                <FormControl><Textarea placeholder="List the benefits (e.g. Health Insurance, 401k)..." className="min-h-[100px]" {...field} /></FormControl>
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
