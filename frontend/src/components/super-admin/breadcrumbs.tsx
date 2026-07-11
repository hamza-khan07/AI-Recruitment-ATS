"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  "super-admin": "Super Admin",
  companies: "Companies",
  "hr-management": "HR Management",
  candidates: "Candidates",
  analytics: "Analytics",
  "activity-logs": "Activity Logs",
  "ai-statistics": "AI Statistics",
};

export function Breadcrumbs() {
  const pathname = usePathname() ?? "/super-admin";
  const parts = pathname.split("/").filter(Boolean);

  const crumbs = parts.map((_, idx) => {
    const segment = parts[idx];
    const href = "/" + parts.slice(0, idx + 1).join("/");
    const label = LABELS[segment] ?? segment.replace(/-/g, " ");
    return { href, label };
  });

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <li>
          <Link href="/super-admin" className="text-zinc-500 hover:underline dark:text-zinc-400">Dashboard</Link>
        </li>
        {crumbs.map((c, i) => (
          <li key={c.href} className="flex items-center gap-2">
            <span className="select-none">/</span>
            {i === crumbs.length - 1 ? (
              <span className="font-medium text-zinc-900 dark:text-white">{c.label}</span>
            ) : (
              <Link href={c.href} className="text-zinc-500 hover:underline dark:text-zinc-400">{c.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
