"use client";

import { useState } from "react";
import { Sidebar } from "@/components/super-admin/sidebar";
import { Topbar } from "@/components/super-admin/topbar";
import { AnalyticsChartCard, type AnalyticsSeriesPoint } from "@/components/super-admin/analytics-chart";
import { DashboardCard } from "@/components/super-admin/dashboard-card";

const companiesSeries: AnalyticsSeriesPoint[] = [
  { label: "01", value: 24 },
  { label: "05", value: 38 },
  { label: "10", value: 46 },
  { label: "15", value: 55 },
  { label: "20", value: 61 },
  { label: "25", value: 70 },
  { label: "30", value: 78 },
];

const jobsSeries: AnalyticsSeriesPoint[] = [
  { label: "01", value: 12 },
  { label: "05", value: 18 },
  { label: "10", value: 26 },
  { label: "15", value: 33 },
  { label: "20", value: 41 },
  { label: "25", value: 54 },
  { label: "30", value: 60 },
];

const applicationsSeries: AnalyticsSeriesPoint[] = [
  { label: "01", value: 180 },
  { label: "05", value: 215 },
  { label: "10", value: 260 },
  { label: "15", value: 300 },
  { label: "20", value: 345 },
  { label: "25", value: 390 },
  { label: "30", value: 420 },
];

const hrSeries: AnalyticsSeriesPoint[] = [
  { label: "01", value: 5 },
  { label: "05", value: 9 },
  { label: "10", value: 13 },
  { label: "15", value: 16 },
  { label: "20", value: 21 },
  { label: "25", value: 24 },
  { label: "30", value: 27 },
];

const summaryCards = [
  {
    title: "Companies Joined",
    value: "0",
    description: "New companies onboarded this month.",
    icon: "🏢",
    trend: "+18% from last month",
  },
  {
    title: "Jobs Posted",
    value: "0",
    description: "Open positions published this month.",
    icon: "🧭",
    trend: "+12% from last month",
  },
  {
    title: "Applications Received",
    value: "0",
    description: "Candidate submissions across all jobs.",
    icon: "✉️",
    trend: "+22% from last month",
  },
  {
    title: "HR Registrations",
    value: "0",
    description: "New HR accounts joined this month.",
    icon: "👥",
    trend: "+15% from last month",
  },
];

export default function AnalyticsPage() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <div className="lg:sticky lg:top-0 lg:h-screen lg:min-h-screen lg:overflow-y-auto">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        </div>

        <main className="flex-1">
          <Topbar onLogout={() => { window.localStorage.removeItem("ats_access_token"); window.location.href = "/login"; }} />

          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            <section className="overflow-hidden rounded-[1.25rem] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Analytics</p>
                  <h1 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">Platform Analytics</h1>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  Enterprise insights for platform adoption, hiring velocity, and candidate activity.
                </p>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              {summaryCards.map((card) => (
                <DashboardCard key={card.title} {...card} className="min-h-[220px]" />
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <AnalyticsChartCard
                title="Companies Joined This Month"
                description="New companies that joined the platform over the last 30 days."
                data={companiesSeries}
                valueLabel="0"
                chartType="area"
                accentColor="#22c55e"
              />
              <AnalyticsChartCard
                title="Jobs Posted"
                description="Open positions published across all companies."
                data={jobsSeries}
                valueLabel="0"
                chartType="bar"
                accentColor="#0ea5e9"
              />
              <AnalyticsChartCard
                title="Applications Received"
                description="Total candidate applications received this month."
                data={applicationsSeries}
                valueLabel="0"
                chartType="area"
                accentColor="#f97316"
              />
              <AnalyticsChartCard
                title="HR Registrations"
                description="New HR accounts created during the month."
                data={hrSeries}
                valueLabel="0"
                chartType="bar"
                accentColor="#8b5cf6"
              />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
