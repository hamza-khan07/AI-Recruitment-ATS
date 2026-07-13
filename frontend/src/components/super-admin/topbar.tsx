"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/super-admin/breadcrumbs";

interface TopbarProps {
  onLogout: () => void;
}

const PATH_TITLES: Record<string, string> = {
  "/super-admin": "Overview",
  "/super-admin/companies": "Company Management",
  "/super-admin/hr-management": "HR Management",
  "/super-admin/candidates": "Candidate Monitoring",
  "/super-admin/analytics": "Platform Analytics",
  "/super-admin/activity-logs": "Activity Logs",
  "/super-admin/ai-statistics": "AI Statistics",
};

export function Topbar({ onLogout }: TopbarProps) {
  const pathname = usePathname() ?? "/super-admin";
  const prevPath = useRef(pathname);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 500);
      prevPath.current = pathname;
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const title = PATH_TITLES[pathname] ?? PATH_TITLES[Object.keys(PATH_TITLES).find((p) => pathname.startsWith(p)) ?? "/super-admin"] ?? "Super Admin";

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Super Admin</p>
          <h1 className="text-2xl font-semibold text-zinc-950 dark:text-white">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          {loading && <div className="mr-2 h-2.5 w-24 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900"><div className="h-2.5 w-16 animate-[shimmer_1.2s_infinite] rounded-full bg-primary" /></div>}
          <Button variant="secondary" size="sm" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="px-6 pb-3">
        <Breadcrumbs />
      </div>
    </header>
  );
}
