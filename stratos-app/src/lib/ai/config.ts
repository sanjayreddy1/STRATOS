// Model names change over time; keep them centralized here.
export const AI_CONFIG = {
  groq: {
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    fastModel: "openai/gpt-oss-120b",
    timeoutMs: 30000,
  },
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    model: "gemini-3.5-flash",
    longContextModel: "gemini-3.5-flash",
    timeoutMs: 45000,
  },
  retry: {
    attempts: 2,
    backoffMs: 800,
  },
} as const;

export type AiProvider = "groq" | "gemini";
export type AiTask =
  | "feedback"
  | "wat" | "srt" | "tat" | "sd" | "ppdt"
  | "quiz" | "interview_followup" | "article_summary" | "workout_adjust"
  | "long_context" | "image" | "weekly_report" | "study_plan";

export function preferredProviderFor(task: AiTask): AiProvider {
  switch (task) {
    case "long_context":
    case "image":
    case "weekly_report":
    case "study_plan":
      return "gemini";
    default:
      return "groq";
  }
}
