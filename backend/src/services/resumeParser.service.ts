import { env } from "../config/env.js";

// ─── Constants ────────────────────────────────────────────────────────────────
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

let PDFParseClass: any = null;
async function getPdfParse() {
  if (!PDFParseClass) {
    const pkg = await import("pdf-parse");
    PDFParseClass = pkg.PDFParse;
  }
  return PDFParseClass;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ParsedResume {
  skills: string[];
  experienceYears: number;
  education: string;
  summary: string;
}

export interface MatchAnalysis {
  matchLabel: "STRONG_MATCH" | "GOOD_MATCH" | "WEAK_MATCH";
  matchSummary: string;
  missingSkills: string[];
}

interface JobData {
  title: string;
  skills?: string | null;
  requirements?: string | null;
  experience?: string | null;
  description?: string | null;
}

// ─── Helper: fetch with timeout ───────────────────────────────────────────────
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs / 1000}s: ${url}`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Helper: Call Groq (with 30s timeout) ────────────────────────────────────
async function callGroq(prompt: string): Promise<string> {
  const response = await fetchWithTimeout(
    GROQ_ENDPOINT,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.groqApiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 800, // Reduced from 1024 — we need small JSON only
      }),
    },
    30000 // 30 second timeout for Groq
  );

  const data = await response.json() as any;
  if (!response.ok) {
    throw new Error(`Groq API error: ${data?.error?.message ?? "Unknown error"}`);
  }
  return data?.choices?.[0]?.message?.content?.trim() ?? "";
}

// ─── Helper: Safe JSON parse from LLM output ──────────────────────────────────
function safeParseJson<T>(text: string): T | null {
  try {
    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    // Try to extract JSON from mixed text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]) as T; } catch { return null; }
    }
    return null;
  }
}

// ─── Step 1: Extract Text from PDF (with timeout) ─────────────────────────────
export async function extractTextFromPdf(resumeUrl: string): Promise<string> {
  console.log(`[ResumeParser] Downloading/Reading PDF: ${resumeUrl}`);

  let buffer: Buffer;

  if (resumeUrl.startsWith("/uploads/")) {
    const fs = await import("fs/promises");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "public", resumeUrl);
    try {
      buffer = await fs.readFile(filePath);
    } catch (err: any) {
      throw new Error(`Failed to read local resume PDF (${filePath}): ${err.message}`);
    }
  } else {
    const response = await fetchWithTimeout(resumeUrl, {}, 15000); // 15s download timeout
    if (!response.ok) {
      throw new Error(`Failed to download resume PDF (HTTP ${response.status}): ${resumeUrl}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  }

  console.log(`[ResumeParser] PDF loaded: ${buffer.length} bytes`);

  const PDFParse = await getPdfParse();
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();

  const text = result.text?.trim() ?? "";
  if (!text || text.length < 30) {
    throw new Error("Could not extract readable text. PDF may be scanned/image-based.");
  }

  return text;
}

// ─── Step 2+3 COMBINED: Single Groq call to parse AND match ──────────────────
// KEY OPTIMIZATION: One API call instead of two. Saves 5-30 seconds.
export async function parseAndMatchResume(
  rawText: string,
  job: JobData
): Promise<{ parsedResume: ParsedResume; matchAnalysis: MatchAnalysis }> {
  // Truncate to 2500 chars (was 3000). Shorter = faster response from Groq.
  const truncated = rawText.slice(0, 2500);

  const prompt = `You are an ATS resume analyzer. Do TWO things in ONE JSON response.

RESUME TEXT:
"""
${truncated}
"""

JOB POSTING:
- Title: ${job.title}
- Required Skills: ${job.skills ?? "Not specified"}
- Experience Required: ${job.experience ?? "Not specified"}
- Requirements: ${(job.requirements ?? "").slice(0, 400)}

Return ONLY this exact JSON (no explanation, no markdown, no extra text):
{
  "skills": ["skill1", "skill2"],
  "experienceYears": 2,
  "education": "BS Computer Science, FAST NUCES (2022)",
  "summary": "2 sentence candidate summary",
  "matchLabel": "GOOD_MATCH",
  "matchSummary": "2 sentence explanation of fit for HR",
  "missingSkills": ["skill1"]
}

Rules:
- skills: max 12 technical/soft skills from resume
- experienceYears: number (0 if fresher)
- education: highest degree, field, institution, year
- matchLabel: "STRONG_MATCH" (75%+ requirements met), "GOOD_MATCH" (50-74%), "WEAK_MATCH" (<50%)
- missingSkills: max 5 skills the job needs but resume lacks
- Return empty arrays [] if nothing found`;

  const responseText = await callGroq(prompt);
  const parsed = safeParseJson<ParsedResume & MatchAnalysis>(responseText);

  if (!parsed || !Array.isArray(parsed.skills)) {
    throw new Error(`Groq returned invalid JSON. Raw: ${responseText.slice(0, 200)}`);
  }

  const validLabels = ["STRONG_MATCH", "GOOD_MATCH", "WEAK_MATCH"];
  const matchLabel = validLabels.includes(parsed.matchLabel) ? parsed.matchLabel : "WEAK_MATCH";

  return {
    parsedResume: {
      skills: Array.isArray(parsed.skills) ? parsed.skills.slice(0, 12) : [],
      experienceYears: typeof parsed.experienceYears === "number" ? parsed.experienceYears : 0,
      education: typeof parsed.education === "string" ? parsed.education : "",
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
    },
    matchAnalysis: {
      matchLabel: matchLabel as MatchAnalysis["matchLabel"],
      matchSummary: typeof parsed.matchSummary === "string" ? parsed.matchSummary : "",
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills.slice(0, 5) : [],
    },
  };
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────
export async function analyzeResume(
  applicationId: string,
  resumeUrl: string,
  job: JobData,
  saveCallback: (id: string, data: {
    resumeText: string;
    parsedResume: object;
    matchLabel: string;
    matchSummary: string;
    missingSkills: string[];
    aiAnalyzedAt: Date;
  }) => Promise<void>
): Promise<void> {
  const start = Date.now();
  try {
    console.log(`[ResumeParser] ▶ Starting analysis for application ${applicationId}`);

    // Step 1: Download & extract PDF text
    const rawText = await extractTextFromPdf(resumeUrl);
    console.log(`[ResumeParser] ✓ PDF extracted: ${rawText.length} chars (${Date.now() - start}ms)`);

    // Step 2+3 Combined: Single Groq call
    const { parsedResume, matchAnalysis } = await parseAndMatchResume(rawText, job);
    console.log(`[ResumeParser] ✓ AI analysis done: ${matchAnalysis.matchLabel} (${Date.now() - start}ms)`);

    await saveCallback(applicationId, {
      resumeText: rawText.slice(0, 5000),
      parsedResume,
      matchLabel: matchAnalysis.matchLabel,
      matchSummary: matchAnalysis.matchSummary,
      missingSkills: matchAnalysis.missingSkills,
      aiAnalyzedAt: new Date(),
    });

    console.log(`[ResumeParser] ✅ Saved for ${applicationId}. Total time: ${Date.now() - start}ms`);
  } catch (error: any) {
    console.error(`[ResumeParser] ❌ Failed for ${applicationId} after ${Date.now() - start}ms:`, error.message);

    // Save PARSE_FAILED marker so HR sees a result, not infinite "Analyzing..."
    try {
      await saveCallback(applicationId, {
        resumeText: "",
        parsedResume: {},
        matchLabel: "PARSE_FAILED",
        matchSummary: error.message ?? "Analysis failed.",
        missingSkills: [],
        aiAnalyzedAt: new Date(),
      });
    } catch (saveError: any) {
      console.error(`[ResumeParser] Could not save failure marker:`, saveError.message);
    }
  }
}
