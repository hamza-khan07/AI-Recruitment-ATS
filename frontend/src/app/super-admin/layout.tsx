import type { ReactNode } from "react";
import { SuperAdminProtected } from "@/components/super-admin/super-admin-protected";

export const metadata = {
  title: "Super Admin Dashboard",
};

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SuperAdminProtected>{children}</SuperAdminProtected>
    </section>
  );
}
