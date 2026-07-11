"use client";

import { useMemo, useState } from "react";
import { Briefcase, CalendarDays, CheckCircle2, FileText, Plus, Star, Users, XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const summaryMetrics = [
  { title: "Total openings", value: "3", tone: "blue", icon: Briefcase },
  { title: "Total applications", value: "20", tone: "orange", icon: FileText },
  { title: "Total hired", value: "6", tone: "green", icon: CheckCircle2 },
  { title: "Total rejected", value: "3", tone: "red", icon: XCircle },
  { title: "New applications", value: "4", tone: "purple", icon: Star },
  { title: "Shortlisted candidates", value: "7", tone: "lightPurple", icon: Users },
  { title: "Today interviews", value: "0", tone: "brown", icon: CalendarDays },
];

const initialTasks: Array<{ id: string; title: string; status: string }> = [];

const toneStyles: Record<string, string> = {
  blue: "bg-sky-600 text-white border-transparent",
  orange: "bg-orange-500 text-white border-transparent",
  green: "bg-emerald-600 text-white border-transparent",
  red: "bg-rose-500 text-white border-transparent",
  purple: "bg-violet-600 text-white border-transparent",
  lightPurple: "bg-fuchsia-700 text-white border-transparent",
  brown: "bg-amber-900 text-white border-transparent",
};

export default function HrManagementHomePage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [showModal, setShowModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "Medium", category: "General", dueDate: "" });

  const pendingTasks = useMemo(() => tasks.filter((task) => task.status === "pending"), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((task) => task.status === "completed"), [tasks]);

  const handleSave = () => {
    if (!taskForm.title.trim()) return;
    setTasks((current) => [
      ...current,
      { id: `${Date.now()}`, title: taskForm.title.trim(), status: "pending" },
    ]);
    setTaskForm({ title: "", description: "", priority: "Medium", category: "General", dueDate: "" });
    setShowModal(false);
  };

  return (
    <main className="px-6 py-4 lg:px-8 lg:py-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">HR Portal</p>
          <h1 className="text-3xl font-semibold text-slate-950">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">Welcome back, Admin. Here’s what’s happening today.</p>
        </div>
        <Button className="inline-flex items-center gap-2 bg-sky-600 text-white hover:bg-sky-700">
          <Plus className="h-4 w-4" />
          New Job Post
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.7fr_0.95fr]">
        <div className="space-y-5">

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.title} className={`rounded-2xl p-4 shadow-sm ${toneStyles[metric.tone]}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${metric.tone === "white" ? "bg-slate-100 text-slate-900" : "bg-white/10 text-white"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className={`text-4xl font-semibold leading-none ${metric.tone === "white" ? "text-slate-950" : "text-white"}`}>{metric.value}</p>
                    <p className={`mt-2 text-xs uppercase tracking-[0.2em] ${metric.tone === "white" ? "text-slate-500" : "text-slate-200"}`}>{metric.title}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">Priority queue</p>
                  <h4 className="mt-1 text-xl font-semibold text-slate-950">What needs attention</h4>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">Focus</span>
              </div>
            </CardHeader>
            <CardContent className="py-8 text-center text-sm text-slate-500">
              No priority items available.
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">ToDo List</p>
                <h4 className="mt-1 text-xl font-semibold text-slate-950">Manage daily tasks</h4>
              </div>
              <Button size="sm" className="inline-flex items-center gap-2" onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4" />
                Add task
              </Button>
            </CardHeader>
            <CardContent className="py-8 text-center text-sm text-slate-500">
              No tasks are available.
            </CardContent>
          </Card>
        </div>
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">
          <div className="w-full max-w-3xl rounded-[2rem] bg-white shadow-2xl">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-8 py-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Create ToDo Item</h2>
                <p className="mt-2 text-sm text-slate-500">Add a task to your HR workflow and keep the team aligned.</p>
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                onClick={() => setShowModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(100vh-6rem)] overflow-y-auto p-8">
              <div className="grid gap-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
                  <input
                    value={taskForm.title}
                    onChange={(event) => setTaskForm((prev) => ({ ...prev, title: event.target.value }))}
                    className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    placeholder="Task title"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    value={taskForm.description}
                    onChange={(event) => setTaskForm((prev) => ({ ...prev, description: event.target.value }))}
                    className="min-h-[140px] w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    placeholder="Optional details about this task..."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(event) => setTaskForm((prev) => ({ ...prev, priority: event.target.value }))}
                      className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Tag / Category</label>
                    <select
                      value={taskForm.category}
                      onChange={(event) => setTaskForm((prev) => ({ ...prev, category: event.target.value }))}
                      className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    >
                      <option>General</option>
                      <option>Interview</option>
                      <option>Offer</option>
                      <option>Onboarding</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(event) => setTaskForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                    className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button variant="ghost" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
