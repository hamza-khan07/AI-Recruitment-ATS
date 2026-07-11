"use client";

import { useFetch } from "@/hooks/useFetch";
import type { AiActivityEntry } from "@/components/super-admin/ai-activity-table";

export function useAiActivity() {
  const { data, loading, error } = useFetch<AiActivityEntry[]>("/api/v1/ai/activity");
  return { activities: data ?? null, loading, error };
}
