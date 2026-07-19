import type { Request, Response } from "express";
import { env } from "../config/env.js";

// ─── Groq API Config ───────────────────────────────────────────────────────────
// We use the REST API directly instead of the SDK to avoid adding new dependencies.
//
// The REST endpoint: api.groq.com/openai/v1/chat/completions
// Auth: Authorization: Bearer <API_KEY>
const GROQ_MODEL = "llama-3.1-8b-instant";
const GROQ_ENDPOINT = `https://api.groq.com/openai/v1/chat/completions`;

// ─── Type Definitions ────────────────────────────────────────────────────────
type GeneratableField =
  | "description"
  | "responsibilities"
  | "requirements"
  | "qualifications"
  | "skills"
  | "benefits";

interface JobContext {
  title: string;
  department?: string;
  employmentType?: string;
  workMode?: string;
  experience?: string;
  location?: string;
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────
// This is the BRAIN of our AI feature. Each field gets a carefully crafted
// prompt that instructs Groq exactly what to generate.
function buildPrompt(field: GeneratableField, context: JobContext): string {
  const { title, department, employmentType, workMode, experience, location } = context;

  // Build a shared context line that all prompts use
  const contextLine = [
    `Job Title: "${title}"`,
    department && `Department: ${department}`,
    employmentType && `Employment Type: ${employmentType}`,
    workMode && `Work Mode: ${workMode}`,
    experience && `Experience Level: ${experience}`,
    location && `Location: ${location}`,
  ]
    .filter(Boolean)
    .join(", ");

  const prompts: Record<GeneratableField, string> = {
    // Description: Wants a professional overview paragraph
    description: `You are an expert HR copywriter. Write a compelling, professional job description overview for the following role.
Context: ${contextLine}
Instructions:
- Write 2-3 clear paragraphs
- Start with what the company/team does, then describe the role's impact
- Make it engaging and enticing for top talent
- Do NOT use markdown headers or bullet points - just flowing paragraphs
- Keep it between 150-220 words
Output ONLY the description text, nothing else.`,

    // Responsibilities: Needs bullet points, action verbs
    responsibilities: `You are an expert HR professional. Generate a clear list of key job responsibilities for this role.
Context: ${contextLine}
Instructions:
- Generate exactly 6-8 bullet points
- Start each bullet point with a strong action verb (e.g., Design, Lead, Build, Collaborate)
- Be specific to the role and experience level
- Each bullet point should be one concise sentence
- Output ONLY the bullet points, one per line, starting with "• "
Output ONLY the bullet points, nothing else.`,

    // Requirements: Must-have qualifications
    requirements: `You are an expert HR professional. Generate a concise list of job requirements (must-haves) for this role.
Context: ${contextLine}
Instructions:
- Generate 5-7 bullet points of REQUIRED qualifications
- These should be non-negotiable must-haves, not nice-to-haves
- Tailor to the experience level specified
- Include years of experience, specific skills, and domain knowledge
- Each bullet point starts with "• "
Output ONLY the bullet points, nothing else.`,

    // Qualifications: Educational / credentials
    qualifications: `You are an expert HR professional. Generate a list of qualifications (education, certifications) for this role.
Context: ${contextLine}
Instructions:
- Generate 3-5 bullet points about educational and professional qualifications
- Include degree requirements, preferred certifications, and alternative equivalent experience
- Keep it realistic and not overly restrictive
- Each bullet point starts with "• "
Output ONLY the bullet points, nothing else.`,

    // Skills: Just a clean comma-separated list
    skills: `You are a technical recruiter. Generate a list of key technical and soft skills required for this role.
Context: ${contextLine}
Instructions:
- List 8-12 relevant skills
- Mix technical skills specific to the role with relevant soft skills
- Format as a comma-separated list (e.g., "React, Node.js, Problem Solving")
- Do NOT use bullet points or any other formatting
Output ONLY the comma-separated skill list, nothing else.`,

    // Benefits: Common perks
    benefits: `You are an HR professional. Suggest a compelling list of employee benefits for a company hiring for this role.
Context: ${contextLine}
Instructions:
- Generate 6-8 benefit bullet points
- Mix standard benefits (health, PTO) with modern perks (remote work, learning budget)
- Make them sound appealing and specific
- Each bullet point starts with "• "
Output ONLY the bullet points, nothing else.`,
  };

  return prompts[field];
}

// ─── Controller Function ──────────────────────────────────────────────────────
export const generateJobContent = async (req: Request, res: Response) => {
  try {
    // 1. Validate API Key exists
    if (!env.groqApiKey) {
      return res.status(500).json({
        success: false,
        message: "AI service is not configured. Please add GROQ_API_KEY to your .env file.",
      });
    }

    // 2. Extract the field name and job context from the request body
    const { field, context } = req.body as {
      field: GeneratableField;
      context: JobContext;
    };

    // 3. Validate inputs
    const validFields: GeneratableField[] = [
      "description", "responsibilities", "requirements",
      "qualifications", "skills", "benefits",
    ];

    if (!field || !validFields.includes(field)) {
      return res.status(400).json({
        success: false,
        message: `Invalid field. Must be one of: ${validFields.join(", ")}`,
      });
    }

    if (!context?.title || context.title.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Job title is required to generate AI content.",
      });
    }

    // 4. Build the tailored prompt for this specific field
    const prompt = buildPrompt(field, context);

    // 5. Call Groq REST API directly using fetch
    const groqResponse = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.groqApiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    // 6. Parse the response
    const groqData = await groqResponse.json() as any;

    // 7. Handle API-level errors
    if (!groqResponse.ok) {
      const apiError = groqData?.error;
      console.error("[AI] Groq API error:", apiError);

      if (groqResponse.status === 429 || apiError?.code === "rate_limit_exceeded") {
        return res.status(429).json({ success: false, message: "AI quota exceeded. Please wait a moment and try again." });
      }
      if (groqResponse.status === 401 || groqResponse.status === 403) {
        return res.status(500).json({ success: false, message: "Invalid Groq API key. Please check your GROQ_API_KEY in .env." });
      }
      return res.status(500).json({ success: false, message: apiError?.message || "Groq API error." });
    }

    // 8. Extract the text from the response
    const generatedText: string = groqData?.choices?.[0]?.message?.content?.trim() ?? "";

    if (!generatedText) {
      return res.status(500).json({ success: false, message: "AI returned empty response. Please try again." });
    }

    // 9. Return the generated text to the frontend
    return res.status(200).json({
      success: true,
      data: { text: generatedText, field },
    });

  } catch (error: any) {
    console.error("[AI] Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to generate content. Please try again.",
    });
  }
};
