"use client";

import type { ApplicationStatus } from "@/types/candidate";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  APPLIED: {
    label: "Applied",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  IN_REVIEW: {
    label: "In Review",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  SHORTLISTED: {
    label: "Shortlisted",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  INTERVIEWED: {
    label: "Interviewed",
    className: "bg-sky-50 text-sky-700 border-sky-200",
  },
  OFFERED: {
    label: "Offered 🎉",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  REJECTED: {
    label: "Not Selected",
    className: "bg-red-50 text-red-600 border-red-200",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    className: "bg-zinc-50 text-zinc-600 border-zinc-200",
  },
};

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-zinc-50 text-zinc-600 border-zinc-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
