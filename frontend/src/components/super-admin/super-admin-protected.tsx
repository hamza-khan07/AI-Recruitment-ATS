"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, getUserRole } from "@/lib/authClient";

interface SuperAdminProtectedProps {
  children: React.ReactNode;
}

export function SuperAdminProtected({ children }: SuperAdminProtectedProps) {
  const router = useRouter();

  useEffect(() => {
    const role = getUserRole();
    const token = getAuthToken();

    if (!token || role !== "SUPER_ADMIN") {
      window.location.href = "/login";
    }
  }, [router]);

  return <>{children}</>;
}
