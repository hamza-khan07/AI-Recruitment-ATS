"use client";

import { useState } from "react";
import { Sidebar } from "@/components/super-admin/sidebar";
import { Topbar } from "@/components/super-admin/topbar";
import { CandidatesTable } from "@/components/super-admin/candidates-table";

export default function CandidatesPage() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <div className="lg:sticky lg:top-0 lg:h-screen lg:min-h-screen lg:overflow-y-auto">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
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
                  <p className="text-sm uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Candidates</p>
                  <h1 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">Candidate Monitoring</h1>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  Track candidate activity with search, filters, and quick moderation actions.
                </p>
              </div>

              <div className="mt-6">
                <CandidatesTable />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
