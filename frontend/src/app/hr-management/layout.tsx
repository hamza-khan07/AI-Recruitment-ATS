import type { ReactNode } from "react";
import { HrPortalLayout } from "@/components/hr/hr-shell";

export const metadata = {
  title: "HR Management Portal",
};

export default function HrManagementLayout({ children }: { children: ReactNode }) {
  return <HrPortalLayout>{children}</HrPortalLayout>;
}
