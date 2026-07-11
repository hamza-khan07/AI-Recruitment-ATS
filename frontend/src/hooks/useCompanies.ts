"use client";

import { useFetch } from "@/hooks/useFetch";
import type { Company } from "@/components/super-admin/company-actions";

export function useCompanies() {
  // backend may provide GET /api/v1/companies
  const { data, loading, error } = useFetch<Company[]>("/api/v1/companies");
  return { companies: data ?? null, loading, error };
}
