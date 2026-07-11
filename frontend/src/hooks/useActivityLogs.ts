"use client";

import { useFetch } from "@/hooks/useFetch";
import type { ActivityLogEntry } from "@/components/super-admin/activity-logs-table";

export function useActivityLogs() {
  const { data, loading, error } = useFetch<ActivityLogEntry[]>("/api/v1/activity-logs");
  return { logs: data ?? null, loading, error };
}
