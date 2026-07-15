import type { ReactNode } from "react";
import { CandidatePortalLayout } from "@/components/candidate/candidate-shell";

export const metadata = {
  title: "Candidate Portal | TalentHub",
  description: "Find your dream job — browse thousands of opportunities, track applications, and build your career.",
};

export default function CandidateLayout({ children }: { children: ReactNode }) {
  return <CandidatePortalLayout>{children}</CandidatePortalLayout>;
}
