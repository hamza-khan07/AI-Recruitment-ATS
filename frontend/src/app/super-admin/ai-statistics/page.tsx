"use client";

import { useState } from "react";
import { Sidebar } from "@/components/super-admin/sidebar";
import { Topbar } from "@/components/super-admin/topbar";
import { DashboardCard } from "@/components/super-admin/dashboard-card";
import { AiUsageChart } from "@/components/super-admin/ai-usage-chart";
import { AiActivityTable } from "@/components/super-admin/ai-activity-table";

const summaryCards = [
  {
    title: "AI Job Descriptions Generated",
    value: "0",
    description: "Generated job descriptions through AI in the last month.",
    icon: "🧠",
    trend: "+14% from last month",
  },
  {
    title: "AI Candidate Summaries Generated",
    value: "0",
    description: "Summaries created for candidates using AI tools.",
    icon: "📄",
    trend: "+18% from last month",
  },
];

const aiUsageData = [
  { month: "Jan", descriptions: 180, summaries: 240 },
  { month: "Feb", descriptions: 210, summaries: 260 },
  { month: "Mar", descriptions: 230, summaries: 290 },
  { month: "Apr", descriptions: 260, summaries: 320 },
  { month: "May", descriptions: 300, summaries: 360 },
  { month: "Jun", descriptions: 340, summaries: 410 },
  { month: "Jul", descriptions: 390, summaries: 470 },
];

export default function AiStatisticsPage() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <div className="lg:sticky lg:top-0 lg:h-screen lg:min-h-screen lg:overflow-y-auto">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        </div>

        <main className="flex-1">
          <Topbar
            onLogout={() => {
              window.localStorage.removeItem("ats_access_token");
              window.location.href = "/login";
            }}
          />

          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            <section className="overflow-hidden rounded-[1.25rem] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">AI Statistics</p>
                  <h1 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">AI Usage Insights</h1>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  Monitor how AI content generation is being used across job descriptions and candidate summaries.
                </p>
              </div>
            </section>

            <section className="grid gap-6 sm:grid-cols-2">
              {summaryCards.map((card) => (
                <DashboardCard key={card.title} {...card} className="min-h-[220px]" />
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <AiUsageChart title="Monthly AI Usage" description="AI generation volume for descriptions and summaries." data={aiUsageData} />
              <AiActivityTable />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
