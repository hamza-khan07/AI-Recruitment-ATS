"use client";

import { useState } from "react";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { MOCK_NOTIFICATIONS, timeAgo } from "@/lib/candidate-mock-data";
import type { Notification, NotificationType } from "@/types/candidate";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<
  NotificationType,
  { label: string; iconClass: string; dotClass: string }
> = {
  APPLICATION_UPDATE: {
    label: "Application Update",
    iconClass: "bg-blue-50 text-blue-600",
    dotClass: "bg-blue-500",
  },
  JOB_MATCH: {
    label: "Job Match",
    iconClass: "bg-purple-50 text-purple-600",
    dotClass: "bg-purple-500",
  },
  INTERVIEW: {
    label: "Interview",
    iconClass: "bg-amber-50 text-amber-600",
    dotClass: "bg-amber-500",
  },
  OFFER: {
    label: "Offer",
    iconClass: "bg-green-50 text-green-600",
    dotClass: "bg-green-500",
  },
  GENERAL: {
    label: "General",
    iconClass: "bg-zinc-50 text-zinc-500",
    dotClass: "bg-zinc-400",
  },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Notifications</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50">
            <BellOff className="h-8 w-8 text-zinc-300" />
          </div>
          <div>
            <p className="font-semibold text-zinc-700">No notifications</p>
            <p className="mt-1 text-sm text-zinc-400">
              You&apos;re all caught up. Check back later!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Unread */}
          {unread.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                New
              </p>
              <div className="space-y-2">
                {unread.map((n) => (
                  <NotificationCard
                    key={n.id}
                    notification={n}
                    onMarkRead={markRead}
                    onDelete={deleteNotification}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Read */}
          {read.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                Earlier
              </p>
              <div className="space-y-2">
                {read.map((n) => (
                  <NotificationCard
                    key={n.id}
                    notification={n}
                    onMarkRead={markRead}
                    onDelete={deleteNotification}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationCard({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = TYPE_CONFIG[notification.type];

  return (
    <div
      className={cn(
        "group relative rounded-2xl border p-4 transition",
        notification.read
          ? "border-zinc-200 bg-white"
          : "border-blue-100 bg-blue-50/30"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Unread dot + Icon */}
        <div className="relative mt-0.5 shrink-0">
          {!notification.read && (
            <span className={cn("absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full", config.dotClass)} />
          )}
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", config.iconClass)}>
            <Bell className="h-5 w-5" />
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                "text-sm font-semibold",
                notification.read ? "text-zinc-700" : "text-zinc-900"
              )}
            >
              {notification.title}
            </p>
            <span className="shrink-0 text-[11px] text-zinc-400">
              {timeAgo(notification.createdAt)}
            </span>
          </div>

          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            {notification.message}
          </p>

          {(notification.jobTitle || notification.companyName) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {notification.jobTitle && (
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600">
                  {notification.jobTitle}
                </span>
              )}
              {notification.companyName && (
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-600">
                  {notification.companyName}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center gap-3">
            {!notification.read && (
              <button
                onClick={() => onMarkRead(notification.id)}
                className="text-[11px] font-medium text-blue-600 transition hover:underline"
              >
                Mark as read
              </button>
            )}
            <button
              onClick={() => onDelete(notification.id)}
              className="text-[11px] font-medium text-zinc-400 transition hover:text-red-500"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
