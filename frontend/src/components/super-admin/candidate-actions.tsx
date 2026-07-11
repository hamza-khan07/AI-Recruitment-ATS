"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  appliedJobs: number;
  resumeUploaded: boolean;
  registrationDate: string;
  status: "active" | "suspended" | "pending";
}

interface CandidateActionsProps {
  candidate: Candidate;
  onView: (candidate: Candidate) => void;
  onSuspend: (id: string) => void;
}

export function CandidateActions({ candidate, onView, onSuspend }: CandidateActionsProps) {
  const [open, setOpen] = useState(false);
  const [confirmSuspend, setConfirmSuspend] = useState(false);

  function handleAction(type: "view" | "suspend") {
    setOpen(false);
    if (type === "view") {
      onView(candidate);
    } else {
      setConfirmSuspend(true);
    }
  }

  function confirm() {
    onSuspend(candidate.id);
    setConfirmSuspend(false);
  }

  function cancel() {
    setConfirmSuspend(false);
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
              View Candidate
            </button>
            {candidate.status !== "suspended" && (
              <button
                type="button"
                onClick={() => handleAction("suspend")}
                className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-zinc-50 dark:text-orange-300 dark:hover:bg-zinc-800"
              >
                Suspend Candidate
              </button>
            )}
          </div>
        </div>
      )}

      {confirmSuspend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Suspend Candidate</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Are you sure you want to suspend {candidate.name}?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancel}
                className="rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                className="rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700"
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
