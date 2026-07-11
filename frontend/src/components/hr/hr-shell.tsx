"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Moon,
  MoreHorizontal,
  Newspaper,
  PanelLeftClose,
  Search,
  Sparkles,
  Sun,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SidebarItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

const sidebarItems: SidebarItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/hr-management", icon: LayoutDashboard },
  { id: "company-profile", label: "Company Profile", href: "/hr-management/company-profile", icon: Building2 },
  { id: "career-page", label: "Career Page", href: "/hr-management/career-page", icon: Newspaper },
  { id: "jobs", label: "Jobs", href: "/hr-management/jobs", icon: BriefcaseBusiness },
  { id: "applications", label: "Applications", href: "/hr-management/applications", icon: FileText },
  { id: "candidates", label: "Candidates", href: "/hr-management/candidates", icon: Users },
  { id: "candidate-pipeline", label: "Candidate Pipeline", href: "/hr-management/candidate-pipeline", icon: Workflow },
  { id: "interview-scheduling", label: "Interview Scheduling", href: "/hr-management/interview-scheduling", icon: CalendarDays },
  { id: "ai-job-description", label: "AI Job Description", href: "/hr-management/ai-job-description", icon: Sparkles },
  { id: "email-templates", label: "Email Templates", href: "/hr-management/email-templates", icon: Mail },
];

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  "company-profile": "Company Profile",
  "career-page": "Career Page",
  jobs: "Jobs",
  applications: "Applications",
  candidates: "Candidates",
  "candidate-pipeline": "Candidate Pipeline",
  "interview-scheduling": "Interview Scheduling",
  "ai-job-description": "AI Job Description",
  "email-templates": "Email Templates",
};

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [{ label: "HR Management", href: "/hr-management" }];

  if (segments.length > 2) {
    const pageKey = segments[2];
    const label = pageTitles[pageKey] ?? "Page";
    crumbs.push({ label, href: pathname });
  }

  return crumbs;
}

function isActive(pathname: string, href: string) {
  if (href === "/hr-management") {
    return pathname === "/hr-management" || pathname === "/hr-management/";
  }

  return pathname.startsWith(href);
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onClose,
  onToggle,
  activePath,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  activePath: string;
}) {
  const sidebarContent = (
    <div className="flex h-full flex-col bg-slate-950 text-white">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-950">
            HR
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-white">HR Management</p>
              <p className="text-xs text-slate-400">Portal</p>
            </div>
          )}
        </div>

        <Button variant="ghost" size="icon-sm" onClick={onToggle} className="hidden lg:inline-flex text-slate-300 hover:text-white">
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon-sm" onClick={onClose} className="lg:hidden text-slate-300 hover:text-white">
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {sidebarItems.map((item) => {
          const active = isActive(activePath, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-2.5">
        <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white">
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 border-r border-slate-900 bg-slate-950 text-white transition-all duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          collapsed ? "w-20" : "w-56",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}

export function SidebarMenu({ children }: { children: ReactNode }) {
  return <div className="space-y-1">{children}</div>;
}

export function SidebarItem({
  active,
  icon: Icon,
  label,
  href,
}: {
  active?: boolean;
  icon: LucideIcon;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-white",
        active
          ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
          : "text-zinc-600 dark:text-zinc-400"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

export function HrBreadcrumb({ items }: { items: Array<{ label: string; href: string }> }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          {index > 0 && <span>/</span>}
          <Link href={item.href} className="transition hover:text-zinc-950 dark:hover:text-white">
            {item.label}
          </Link>
        </div>
      ))}
    </nav>
  );
}

export function UserProfileDropdown() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950">
        HR
      </div>
      <div className="hidden text-left sm:block">
        <p className="text-sm font-medium">HR Team</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Talent Operations</p>
      </div>
      <Button variant="ghost" size="icon-sm" aria-label="More options">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function TopNavbar({
  title,
  breadcrumbs,
  onMenuToggle,
}: {
  title: string;
  breadcrumbs: Array<{ label: string; href: string }>;
  onMenuToggle: () => void;
}) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur shadow-sm dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={onMenuToggle}>
            <Menu className="h-4 w-4" />
          </Button>

          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">HR Portal</p>
            <h1 className="text-lg font-semibold text-zinc-950 dark:text-white">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <label className="hidden items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 md:flex dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <Search className="h-4 w-4" />
            <input
              aria-label="Search"
              placeholder="Search"
              className="w-32 border-none bg-transparent outline-none sm:w-40"
            />
          </label>

          <Button variant="ghost" size="icon-sm" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon-sm" aria-label="Toggle theme" onClick={toggleTheme}>
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <UserProfileDropdown />
        </div>
      </div>

      <div className="px-4 pb-3 sm:px-6 lg:px-8">
        <HrBreadcrumb items={breadcrumbs} />
      </div>
    </header>
  );
}

export function PageContainer({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/10">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">HR Management</p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">{title}</h2>
      </div>

      {children}
    </section>
  );
}

export function HrPortalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/hr-management";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const breadcrumbs = useMemo(() => buildBreadcrumbs(pathname), [pathname]);
  const activeTitle = useMemo(() => {
    const slug = pathname.split("/").filter(Boolean).at(2) ?? "dashboard";
    return pageTitles[slug] ?? "Dashboard";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onToggle={() => setCollapsed((value) => !value)}
          activePath={pathname}
        />

        <main className="flex-1">
          <TopNavbar
            title={activeTitle}
            breadcrumbs={breadcrumbs}
            onMenuToggle={() => setMobileOpen((value) => !value)}
          />

          <div className="px-4 py-4 sm:px-6 sm:py-4 lg:px-8 lg:py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
