"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Bookmark,
  Briefcase,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  X,
} from "lucide-react";
import { removeAuthToken } from "@/lib/authClient";
import { MOCK_NOTIFICATIONS } from "@/lib/candidate-mock-data";
import { cn } from "@/lib/utils";
import { SearchBar } from "./search-bar";

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "dashboard", label: "Home", href: "/candidate/dashboard", icon: LayoutDashboard },
  { id: "jobs", label: "Jobs", href: "/candidate/jobs", icon: Briefcase },
  { id: "applications", label: "My Applications", href: "/candidate/applications", icon: FileText },
  { id: "saved", label: "Saved", href: "/candidate/saved", icon: Bookmark },
  { id: "profile", label: "Profile", href: "/candidate/profile", icon: User },
];

// ─── Notification Dropdown ────────────────────────────────────────────────────

function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read);
  const all = MOCK_NOTIFICATIONS;

  return (
    <div className="absolute right-0 top-12 z-50 w-96 rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Notifications</h3>
          {unread.length > 0 && (
            <p className="text-xs text-blue-600">{unread.length} new</p>
          )}
        </div>
        <Link
          href="/candidate/notifications"
          onClick={onClose}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          See all
        </Link>
      </div>
      <div className="max-h-80 divide-y divide-zinc-50 overflow-y-auto">
        {all.slice(0, 5).map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "flex gap-3 px-4 py-3 transition hover:bg-zinc-50",
              !notification.read && "bg-blue-50/40"
            )}
          >
            <div
              className={cn(
                "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                notification.read ? "bg-zinc-300" : "bg-blue-500"
              )}
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-800">{notification.title}</p>
              <p className="mt-0.5 text-xs text-zinc-500 line-clamp-2">{notification.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── User Dropdown ────────────────────────────────────────────────────────────

function UserDropdown({ 
  onClose, 
  onLogout,
  user 
}: { 
  onClose: () => void; 
  onLogout: () => void;
  user: { name: string; email: string; role?: string } | null;
}) {
  const displayName = user?.name || "Candidate";
  const displayRole = user?.role === "CANDIDATE" ? "Candidate" : user?.role || "Candidate";

  return (
    <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-zinc-200 bg-white py-1 shadow-xl shadow-zinc-200/50">
      <div className="border-b border-zinc-100 px-4 py-3">
        <p className="text-sm font-semibold text-zinc-900">{displayName}</p>
        <p className="text-xs text-zinc-500">{displayRole}</p>
      </div>
      <Link
        href="/candidate/profile"
        onClick={onClose}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition hover:bg-zinc-50"
      >
        <User className="h-4 w-4 text-zinc-400" />
        View Profile
      </Link>
      <Link
        href="/candidate/applications"
        onClick={onClose}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition hover:bg-zinc-50"
      >
        <FileText className="h-4 w-4 text-zinc-400" />
        My Applications
      </Link>
      <div className="border-t border-zinc-100 mt-1">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

// ─── Mobile Nav Drawer ────────────────────────────────────────────────────────

function MobileDrawer({
  open,
  onClose,
  activePath,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  activePath: string;
  onLogout: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <button
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
          aria-label="Close menu"
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
              ATS
            </div>
            <span className="font-bold text-zinc-900">Talent Portal</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="space-y-0.5 px-3 py-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activePath.startsWith(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-zinc-100 p-3">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Top Navbar ───────────────────────────────────────────────────────────────

function TopNavbar({ activePath }: { activePath: string }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<{name: string, email: string, role?: string} | null>(null);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);

    const authRaw = localStorage.getItem("auth_session");
    if (authRaw) {
      try {
        const authData = JSON.parse(authRaw);
        if (authData.user) {
          setUser(authData.user);
        }
      } catch (err) {}
    }
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const handleLogout = () => {
    removeAuthToken();
    router.replace("/login");
  };

  const closeDropdowns = () => {
    setNotifOpen(false);
    setUserOpen(false);
  };

  const userInitials = user?.name ? user.name.slice(0, 2).toUpperCase() : "U";
  const userFirstName = user?.name ? user.name.split(" ")[0] : "User";

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link href="/candidate/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm shadow-blue-200">
              ATS
            </div>
            <span className="hidden text-lg font-bold text-zinc-900 sm:block">
              Talent<span className="text-blue-600">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-1 lg:flex ml-4">
            {NAV_ITEMS.map((item) => {
              const active = activePath.startsWith(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  setUserOpen(false);
                }}
                aria-label="Notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-blue-600" />
                )}
              </button>
              {notifOpen && (
                <NotificationDropdown onClose={() => setNotifOpen(false)} />
              )}
            </div>

            {/* User Avatar */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserOpen((prev) => !prev);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 px-2 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {userInitials}
                </div>
                <span className="hidden text-xs sm:block">{userFirstName}</span>
                <ChevronDown className="h-3 w-3 text-zinc-400 hidden sm:block" />
              </button>
              {userOpen && (
                <UserDropdown onClose={closeDropdowns} onLogout={handleLogout} user={user} />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Click-outside to close dropdowns */}
      {(notifOpen || userOpen) && (
        <div className="fixed inset-0 z-20" onClick={closeDropdowns} />
      )}

      {/* Mobile Drawer */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        activePath={activePath}
        onLogout={handleLogout}
      />
    </>
  );
}

// ─── Candidate Portal Layout ──────────────────────────────────────────────────

export function CandidatePortalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/candidate/dashboard";

  return (
    <div className="min-h-screen bg-zinc-50">
      <TopNavbar activePath={pathname} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
