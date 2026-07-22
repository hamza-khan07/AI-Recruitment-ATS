import { cn } from "@/lib/utils";
import { Sparkles, AlertCircle, Loader2, FileText } from "lucide-react";

export type MatchLabel = "STRONG_MATCH" | "GOOD_MATCH" | "WEAK_MATCH" | "PARSE_FAILED" | null | undefined;

interface MatchScoreBadgeProps {
  matchLabel: MatchLabel;
  hasResume?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const config: Record<
  Exclude<MatchLabel, null | undefined>,
  { label: string; color: string; dot: string }
> = {
  STRONG_MATCH: {
    label: "Strong Match",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  GOOD_MATCH: {
    label: "Good Match",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  WEAK_MATCH: {
    label: "Weak Match",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  PARSE_FAILED: {
    label: "Parse Failed",
    color: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-400",
  },
};

const sizeClass = {
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-sm px-2.5 py-1 gap-1.5",
  lg: "text-sm px-3 py-1.5 gap-2 font-semibold",
};

export function MatchScoreBadge({ matchLabel, hasResume = true, size = "md", className }: MatchScoreBadgeProps) {
  // null means analysis hasn't run yet
  if (matchLabel === null || matchLabel === undefined) {
    if (!hasResume) {
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full border text-xs px-2 py-0.5 gap-1",
            "bg-gray-50 text-gray-400 border-gray-200",
            className
          )}
        >
          <FileText className="h-3 w-3" />
          No Resume
        </span>
      );
    }
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border text-xs px-2 py-0.5 gap-1",
          "bg-gray-50 text-gray-400 border-gray-200",
          className
        )}
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        Analyzing…
      </span>
    );
  }

  if (matchLabel === "PARSE_FAILED") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border",
          sizeClass[size],
          config.PARSE_FAILED.color,
          className
        )}
        title="Resume could not be parsed. It may be a scanned or image-based PDF."
      >
        <AlertCircle className="h-3 w-3 flex-shrink-0" />
        Parse Failed
      </span>
    );
  }

  const { label, color, dot } = config[matchLabel];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border",
        sizeClass[size],
        color,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", dot)} />
      {label}
    </span>
  );
}

// ─── Larger AI Panel Component ────────────────────────────────────────────────
// Used in the application detail page to show the full AI analysis.
interface AiAnalysisPanelProps {
  matchLabel: MatchLabel;
  matchSummary?: string | null;
  parsedResume?: {
    skills?: string[];
    experienceYears?: number;
    education?: string;
    summary?: string;
  } | null;
  missingSkills?: string[];
  aiAnalyzedAt?: string | null;
  onReanalyze?: () => void;
  isReanalyzing?: boolean;
  hasResume?: boolean;
}

export function AiAnalysisPanel({
  matchLabel,
  matchSummary,
  parsedResume,
  missingSkills = [],
  aiAnalyzedAt,
  onReanalyze,
  isReanalyzing,
  hasResume = true,
}: AiAnalysisPanelProps) {
  const hasAnalysis = matchLabel && matchLabel !== "PARSE_FAILED";
  const analyzedDate = aiAnalyzedAt ? new Date(aiAnalyzedAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  }) : null;

  return (
    <div className="rounded-xl border bg-gradient-to-br from-slate-50 to-white p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
            <Sparkles className="h-4 w-4 text-violet-600" />
          </div>
          <span className="text-sm font-semibold text-slate-800">AI Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <MatchScoreBadge matchLabel={matchLabel} hasResume={hasResume} size="md" />
          {onReanalyze && (
            <button
              onClick={onReanalyze}
              disabled={isReanalyzing}
              className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 transition-colors disabled:opacity-50"
            >
              {isReanalyzing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              {isReanalyzing ? "Analyzing…" : "Re-analyze"}
            </button>
          )}
        </div>
      </div>

      {/* PARSE_FAILED state */}
      {matchLabel === "PARSE_FAILED" && (
        <div className="rounded-lg bg-red-50 border border-red-100 p-3">
          <p className="text-xs text-red-600">
            ⚠️ Resume could not be parsed. This may be a scanned or image-based PDF. Ask the candidate to upload a text-based PDF.
          </p>
        </div>
      )}

      {/* No analysis yet */}
      {!matchLabel && (
        <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          <p className="text-xs text-gray-500">AI analysis in progress. Refresh in a few seconds…</p>
        </div>
      )}

      {/* Full analysis */}
      {hasAnalysis && (
        <div className="space-y-4">
          {/* AI Summary */}
          {matchSummary && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Summary</p>
              <p className="text-sm text-slate-700 leading-relaxed">{matchSummary}</p>
            </div>
          )}

          {/* Extracted Skills */}
          {parsedResume?.skills && parsedResume.skills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Extracted Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {parsedResume.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-block rounded-md bg-violet-50 border border-violet-100 px-2 py-0.5 text-xs text-violet-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {missingSkills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Missing Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-block rounded-md bg-red-50 border border-red-100 px-2 py-0.5 text-xs text-red-600"
                  >
                    − {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience & Education Row */}
          <div className="grid grid-cols-2 gap-3">
            {typeof parsedResume?.experienceYears === "number" && (
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-center">
                <p className="text-xl font-bold text-slate-800">{parsedResume.experienceYears}</p>
                <p className="text-xs text-slate-500">Years Exp.</p>
              </div>
            )}
            {parsedResume?.education && (
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <p className="text-xs font-medium text-slate-500 mb-0.5">Education</p>
                <p className="text-xs text-slate-700 leading-snug">{parsedResume.education}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timestamp */}
      {analyzedDate && (
        <p className="text-xs text-slate-400 pt-1 border-t border-slate-100">
          Analyzed {analyzedDate}
        </p>
      )}
    </div>
  );
}
