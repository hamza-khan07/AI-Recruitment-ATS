import type {
  Job,
  Application,
  CandidateProfile,
  Notification,
  Company,
} from "@/types/candidate";

// ─── Companies ────────────────────────────────────────────────────────────────

// MOCK_COMPANIES has been removed and inlined where needed.

// ─── Mock Jobs ────────────────────────────────────────────────────────────────
// MOCK_JOBS has been removed in favor of live API usage.

// ─── Mock Applications ─────────────────────────────────────────────────────────

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: "app1",
    job: {
      id: "job1",
      title: "Senior React Developer",
      company: {
        id: "c1",
        name: "Techlogix",
        logo: "TL",
        industry: "Information Technology",
        size: "1,000–5,000",
        location: "Lahore, Pakistan",
        website: "https://techlogix.com",
        description: "Techlogix is a leading IT services and solutions company delivering digital transformation to clients worldwide.",
      },
      location: "Lahore, Pakistan",
      type: "HYBRID",
    },
    status: "SHORTLISTED",
    appliedAt: "2026-07-11T10:00:00Z",
    updatedAt: "2026-07-12T15:00:00Z",
    coverLetter: "I am excited to apply for this position...",
  },
  {
    id: "app2",
    job: {
      id: "job3",
      title: "UI/UX Designer",
      company: {
        id: "c3",
        name: "Systems Limited",
        logo: "SL",
        industry: "Enterprise Software",
        size: "5,000–10,000",
        location: "Lahore, Pakistan",
        website: "https://systemsltd.com",
        description: "Systems Limited is Pakistan's premier IT company providing enterprise solutions and IT services.",
      },
      location: "Lahore, Pakistan",
      type: "FULL_TIME",
    },
    status: "IN_REVIEW",
    appliedAt: "2026-07-10T09:30:00Z",
    updatedAt: "2026-07-11T11:00:00Z",
  },
  {
    id: "app3",
    job: {
      id: "job5",
      title: "Data Scientist",
      company: {
        id: "c5",
        name: "10Pearls",
        logo: "10",
        industry: "Digital Transformation",
        size: "1,000–5,000",
        location: "Karachi, Pakistan",
        website: "https://10pearls.com",
        description: "10Pearls is a digital innovation company helping organizations build next-generation digital products.",
      },
      location: "Karachi, Pakistan",
      type: "FULL_TIME",
    },
    status: "REJECTED",
    appliedAt: "2026-07-08T08:00:00Z",
    updatedAt: "2026-07-10T14:00:00Z",
  },
  {
    id: "app4",
    job: {
      id: "job8",
      title: "AI/ML Engineer",
      company: {
        id: "c1",
        name: "Techlogix",
        logo: "TL",
        industry: "Information Technology",
        size: "1,000–5,000",
        location: "Lahore, Pakistan",
        website: "https://techlogix.com",
        description: "Techlogix is a leading IT services and solutions company delivering digital transformation to clients worldwide.",
      },
      location: "Remote",
      type: "REMOTE",
    },
    status: "APPLIED",
    appliedAt: "2026-07-13T09:00:00Z",
    updatedAt: "2026-07-13T09:00:00Z",
  },
  {
    id: "app5",
    job: {
      id: "job4",
      title: "DevOps Engineer",
      company: {
        id: "c4",
        name: "NetSol Technologies",
        logo: "NT",
        industry: "FinTech",
        size: "1,000–5,000",
        location: "Lahore, Pakistan",
        website: "https://netsoltech.com",
        description: "NetSol Technologies provides IT services and enterprise software solutions for the global leasing and finance industry.",
      },
      location: "Remote",
      type: "REMOTE",
    },
    status: "INTERVIEWED",
    appliedAt: "2026-07-05T10:00:00Z",
    updatedAt: "2026-07-12T16:00:00Z",
  },
];

// ─── Mock Saved Jobs ──────────────────────────────────────────────────────────

export const INITIAL_SAVED_JOB_IDS = ["job2", "job4", "job7", "job10"];

// ─── Mock Candidate Profile ───────────────────────────────────────────────────

export const MOCK_CANDIDATE_PROFILE: CandidateProfile = {
  id: "cand1",
  name: "Ahmad Hassan",
  email: "ahmad.hassan@email.com",
  phone: "+92 300 1234567",
  location: "Lahore, Pakistan",
  title: "Full Stack Developer",
  bio: "Passionate full-stack developer with 4+ years of experience building scalable web applications. I love solving complex problems and delivering clean, maintainable code.",
  avatar: "AH",
  skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS", "Next.js", "Python"],
  resumeUrl: null,
  workExperience: [
    {
      id: "we1",
      company: "Arbisoft",
      role: "Software Engineer",
      startDate: "2023-01",
      endDate: null,
      current: true,
      description: "Building scalable backend services and React frontend applications for global clients.",
    },
    {
      id: "we2",
      company: "Freelance",
      role: "Full Stack Developer",
      startDate: "2021-06",
      endDate: "2022-12",
      current: false,
      description: "Developed multiple web applications for clients across e-commerce and healthcare sectors.",
    },
  ],
  education: [
    {
      id: "edu1",
      institution: "University of Engineering and Technology, Lahore",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startYear: 2017,
      endYear: 2021,
      current: false,
    },
  ],
  linkedinUrl: "https://linkedin.com/in/ahmadhassan",
  portfolioUrl: "https://ahmadhassan.dev",
};

// ─── Mock Notifications ───────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "APPLICATION_UPDATE",
    title: "Your application was shortlisted! 🎉",
    message: "Congratulations! Techlogix has moved your application for 'Senior React Developer' to the shortlist.",
    read: false,
    createdAt: "2026-07-12T15:00:00Z",
    jobTitle: "Senior React Developer",
    companyName: "Techlogix",
  },
  {
    id: "n2",
    type: "INTERVIEW",
    title: "Interview Scheduled",
    message: "NetSol Technologies has scheduled an interview for 'DevOps Engineer' on July 15, 2026 at 11:00 AM.",
    read: false,
    createdAt: "2026-07-12T10:00:00Z",
    jobTitle: "DevOps Engineer",
    companyName: "NetSol Technologies",
  },
  {
    id: "n3",
    type: "JOB_MATCH",
    title: "New job match for you",
    message: "A new job matching your profile has been posted: 'AI/ML Engineer' at Techlogix.",
    read: false,
    createdAt: "2026-07-12T09:00:00Z",
    jobTitle: "AI/ML Engineer",
    companyName: "Techlogix",
  },
  {
    id: "n4",
    type: "APPLICATION_UPDATE",
    title: "Application under review",
    message: "Systems Limited is reviewing your application for 'UI/UX Designer'.",
    read: true,
    createdAt: "2026-07-11T11:00:00Z",
    jobTitle: "UI/UX Designer",
    companyName: "Systems Limited",
  },
  {
    id: "n5",
    type: "APPLICATION_UPDATE",
    title: "Application not selected",
    message: "We're sorry, 10Pearls has decided not to move forward with your application for 'Data Scientist'.",
    read: true,
    createdAt: "2026-07-10T14:00:00Z",
    jobTitle: "Data Scientist",
    companyName: "10Pearls",
  },
  {
    id: "n6",
    type: "GENERAL",
    title: "Profile completion reminder",
    message: "Complete your profile to increase your chances of getting noticed by top employers. Add your resume and work experience.",
    read: true,
    createdAt: "2026-07-09T09:00:00Z",
  },
];

// ─── Helper: format salary ────────────────────────────────────────────────────

export function formatSalary(min: number, max: number, currency: string): string {
  const fmt = (n: number) => {
    if (n >= 100000) return `${(n / 1000).toFixed(0)}K`;
    return n.toLocaleString();
  };
  return `${currency} ${fmt(min)} – ${fmt(max)}`;
}

// ─── Helper: time ago ─────────────────────────────────────────────────────────

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
}
