"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardCard } from "@/components/super-admin/dashboard-card";
import { Sidebar } from "@/components/super-admin/sidebar";
import { Topbar } from "@/components/super-admin/topbar";
import { removeAuthToken } from "@/lib/authClient";

const overviewCards = [
  {
    title: "Total Companies",
    value: "0",
    description: "Companies registered in the platform.",
    icon: "🏢",
    trend: "+12% this month",
  },
  {
    title: "Total HR Users",
    value: "0",
    description: "HR users actively managing accounts.",
    icon: "👥",
    trend: "+8% this month",
  },
  {
    title: "Total Candidates",
    value: "0",
    description: "Candidates currently in the active pipeline.",
    icon: "📋",
    trend: "+18% this month",
  },
  {
    title: "Active Jobs",
    value: "0",
    description: "Open positions currently listed.",
    icon: "🧭",
    trend: "+6% this month",
  },
  {
    title: "Total Applications",
    value: "0",
    description: "Applications submitted across all companies.",
    icon: "✉️",
    trend: "+9% this month",
  },
  {
    title: "Recent Registrations",
    value: "0",
    description: "New sign-ups in the last 7 days.",
    icon: "🟢",
    trend: "+24% this week",
  },
];

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const cards = useMemo(() => overviewCards, []);

  const handleLogout = () => {
    removeAuthToken();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <div className="lg:sticky lg:top-0 lg:h-screen lg:min-h-screen lg:overflow-y-auto">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        </div>

        <main className="flex-1">
          <Topbar onLogout={handleLogout} />

          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            <section className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm shadow-zinc-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/10 sm:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Overview</p>
                  <h1 className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">Super Admin Dashboard</h1>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  This initial layout uses mock data and reusable components for a responsive Super Admin experience.
                </p>
              </div>
            </section>

            <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map((card) => (
                <DashboardCard key={card.title} {...card} />
              ))}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
