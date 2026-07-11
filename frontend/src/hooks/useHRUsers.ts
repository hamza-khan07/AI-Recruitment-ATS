"use client";

import { useFetch } from "@/hooks/useFetch";
import type { HRUser } from "@/components/super-admin/hr-actions";

export function useHRUsers() {
  const { data, loading, error } = useFetch<HRUser[]>("/api/v1/hr-users");
  return { hrUsers: data ?? null, loading, error };
}
