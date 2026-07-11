"use client";

import { useFetch } from "@/hooks/useFetch";
import type { Candidate } from "@/components/super-admin/candidate-actions";

export function useCandidates() {
  const { data, loading, error } = useFetch<Candidate[]>("/api/v1/candidates");
  return { candidates: data ?? null, loading, error };
}
