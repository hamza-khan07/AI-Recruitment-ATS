"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

const sidebarItems: SidebarItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "📊", href: "/super-admin" },
  { id: "companies", label: "Companies", icon: "🏢", href: "/super-admin/companies" },
  { id: "hr-management", label: "HR Management", icon: "👥", href: "/super-admin/hr-management" },
  { id: "candidates", label: "Candidates", icon: "🧑‍💼", href: "/super-admin/candidates" },
  { id: "analytics", label: "Analytics", icon: "📈", href: "/super-admin/analytics" },
  { id: "activity-logs", label: "Activity Logs", icon: "📝", href: "/super-admin/activity-logs" },
  { id: "ai-statistics", label: "AI Statistics", icon: "🤖", href: "/super-admin/ai-statistics" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname() ?? "/";

  function isActive(itemHref: string) {
    if (itemHref === "/super-admin") return pathname === "/super-admin" || pathname === "/super-admin/";
    return pathname.startsWith(itemHref);
  }

  return (
    <aside className={`flex h-full flex-col border-r border-zinc-200 bg-white text-zinc-900 transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 ${collapsed ? "w-20" : "w-72"}`}>
      <div className="flex items-center justify-between gap-2 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white">SA</div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold">Super Admin</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Control panel</p>
            </div>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={onToggle}>
          {collapsed ? "Open" : "Hide"}
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 py-4">
        {sidebarItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={item.label}
              className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-white ${
                active ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
