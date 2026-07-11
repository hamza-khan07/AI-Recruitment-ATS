"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface HRUser {
  id: string;
  name: string;
  email: string;
  company: string;
  status: "active" | "suspended" | "pending";
  joinedAt: string;
  role: string;
}

interface HRActionsProps {
  user: HRUser;
  onView: (user: HRUser) => void;
  onSuspend: (id: string) => void;
  onActivate: (id: string) => void;
}

type ConfirmType = "suspend" | "activate";

export function HRActions({ user, onView, onSuspend, onActivate }: HRActionsProps) {
  const [open, setOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | ConfirmType>(null);

  function handleAction(type: "view" | ConfirmType) {
    setOpen(false);
    if (type === "view") return onView(user);
    setConfirmAction(type);
  }

  function confirm() {
    if (!confirmAction) return;
    if (confirmAction === "suspend") onSuspend(user.id);
    if (confirmAction === "activate") onActivate(user.id);
    setConfirmAction(null);
  }

  function cancelConfirm() {
    setConfirmAction(null);
  }

  return (
    <div className="relative inline-block text-left">
      <Button variant="outline" size="sm" onClick={() => setOpen((value) => !value)}>
        •••
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 origin-top-right overflow-hidden rounded-lg border border-zinc-100 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="py-1">
            <button
              type="button"
              onClick={() => handleAction("view")}
              className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              View Profile
            </button>
            {user.status === "active" && (
              <button
                type="button"
                onClick={() => handleAction("suspend")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Suspend User
              </button>
            )}
            {user.status !== "active" && (
              <button
                type="button"
                onClick={() => handleAction("activate")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Activate User
              </button>
            )}
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
              {confirmAction === "suspend" ? "Suspend HR User" : "Activate HR User"}
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Are you sure you want to {confirmAction} “{user.name}”?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelConfirm}
                className="rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                className={`rounded-md px-3 py-2 text-sm text-white ${confirmAction === "suspend" ? "bg-red-600" : "bg-primary"}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
