"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface Company {
  id: string;
  name: string;
  status: "active" | "suspended" | "pending";
  logoUrl?: string | null;
  joinedAt: string;
  hrUsers: number;
  jobs: number;
  description?: string;
}

interface CompanyActionsProps {
  company: Company;
  onView: (c: Company) => void;
  onSuspend: (id: string) => void;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CompanyActions({ company, onView, onSuspend, onActivate, onDelete }: CompanyActionsProps) {
  const [open, setOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | { type: "suspend" | "activate" | "delete" }>(null);

  function handleAction(type: "view" | "suspend" | "activate" | "delete") {
    setOpen(false);
    if (type === "view") return onView(company);
    if (type === "suspend") return setConfirmAction({ type: "suspend" });
    if (type === "activate") return setConfirmAction({ type: "activate" });
    if (type === "delete") return setConfirmAction({ type: "delete" });
  }

  function confirm() {
    if (!confirmAction) return;
    if (confirmAction.type === "suspend") onSuspend(company.id);
    if (confirmAction.type === "activate") onActivate(company.id);
    if (confirmAction.type === "delete") onDelete(company.id);
    setConfirmAction(null);
  }

  function cancelConfirm() {
    setConfirmAction(null);
  }

  return (
    <div className="relative inline-block text-left">
      <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
        •••
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 origin-top-right rounded-lg border border-zinc-100 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="py-1">
            <button
              onClick={() => handleAction("view")}
              className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              View Company
            </button>
            {company.status !== "suspended" && (
              <button
                onClick={() => handleAction("suspend")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Suspend Company
              </button>
            )}
            {company.status === "suspended" && (
              <button
                onClick={() => handleAction("activate")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Activate Company
              </button>
            )}
            <div className="border-t border-zinc-100 dark:border-zinc-800" />
            <button
              onClick={() => handleAction("delete")}
              className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-red-50 dark:hover:bg-red-900"
            >
              Delete Company
            </button>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900">
            <h3 className="text-lg font-semibold">
              {confirmAction.type === "delete" && "Delete Company"}
              {confirmAction.type === "suspend" && "Suspend Company"}
              {confirmAction.type === "activate" && "Activate Company"}
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Are you sure you want to {confirmAction.type} "{company.name}"?</p>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={cancelConfirm} className="rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">Cancel</button>
              <button
                onClick={confirm}
                className={`rounded-md px-3 py-2 text-sm ${confirmAction.type === "delete" ? "bg-red-600 text-white" : "bg-primary text-white"}`}
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
