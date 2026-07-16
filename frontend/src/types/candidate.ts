// ─── Job Types ────────────────────────────────────────────────────────────────

export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "REMOTE" | "HYBRID";

export type ExperienceLevel = "ENTRY" | "MID" | "SENIOR" | "LEAD" | "EXECUTIVE";

export type JobStatus = "PUBLISHED" | "DRAFT" | "CLOSED" | "ARCHIVED";

export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  size: string;
  location: string;
  website: string;
  description: string;
  address?: string;
}

export interface Job {
  id: string;
  title: string;
  company: Company;
  location: string;
  type: JobType; // Legacy, keep for compatibility
  workMode?: string;
  employmentType?: string;
  experienceLevel: ExperienceLevel;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  skills: string[];
  status: JobStatus;
  openings: number;
  postedAt: string;
  deadline: string;
  featured: boolean;
}

// ─── Application Types ────────────────────────────────────────────────────────

export type ApplicationStatus =
  | "APPLIED"
  | "IN_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEWED"
  | "OFFERED"
  | "REJECTED"
  | "WITHDRAWN";

export interface Application {
  id: string;
  job: Pick<Job, "id" | "title" | "company" | "location" | "type">;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  coverLetter?: string;
  resumeUrl?: string;
}

// ─── Candidate Profile Types ──────────────────────────────────────────────────

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number | null;
  current: boolean;
}

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  bio: string;
  avatar: string;
  skills: string[];
  resumeUrl: string | null;
  workExperience: WorkExperience[];
  education: Education[];
  linkedinUrl: string;
  portfolioUrl: string;
}

// ─── Notification Types ───────────────────────────────────────────────────────

export type NotificationType = "APPLICATION_UPDATE" | "JOB_MATCH" | "INTERVIEW" | "OFFER" | "GENERAL";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  jobTitle?: string;
  companyName?: string;
}

// ─── Filter Types ─────────────────────────────────────────────────────────────

export interface JobFilters {
  search: string;
  location: string;
  type: JobType | "";
  experienceLevel: ExperienceLevel | "";
  salaryMin: number | "";
  salaryMax: number | "";
}
