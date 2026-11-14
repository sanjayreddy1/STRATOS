import { NextRequest, NextResponse } from "next/server";
import { aiGenerateText } from "@/lib/ai/router";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { context, messages } = body as { context?: any; messages?: { role: "user" | "assistant"; content: string }[] };

  const profile = context?.profile || {};
  const completedDays = context?.completedDays || 0;
  const completedLessons = context?.completedLessons || [];
  const recentTopics = context?.recentTopics || [];
  const dailyLogs = context?.dailyLogs || [];
  const workoutLogs = context?.workoutLogs || [];

  const system = `You are an experienced SSB Interviewing Officer conducting a personal interview for Indian Army TGC/SSC Tech preparation.
Ask ONE clear question at a time. Adapt questions based on candidate progress (completed days/lessons, preparation logs, fitness, engineering background).
Cover: PIQ/personal background, motivation (why Army/technical entry), academics/projects, current affairs/defence awareness, responsibility/leadership/teamwork, situational judgment, and fitness/discipline.
Be professional, probing, and realistic (follow-up like a real IO) but supportive as a practice coach.
Do not give selection predictions. Keep responses concise. If the candidate gives a weak/vague answer, ask a sharper follow-up.
When appropriate, briefly add "(Practice tip: ...)" after your question, but keep the main question clear.`;

  const contextText = `CANDIDATE CONTEXT (local progress):
- Name: ${profile.name || "Candidate"}
- Engineering branch: ${profile.engineering_branch || "Not specified"}
- Graduation year: ${profile.graduation_year || "Not specified"}
- Target date: ${profile.target_date || "Not specified"}
- Daily hours: ${profile.daily_hours || "Not specified"}
- Weak areas: ${(profile.weak_areas || []).join(", ") || "Not specified"}
- Completed lesson days: ${completedDays}
- Recently completed lesson topics: ${completedLessons.slice(0, 10).join("; ") || "None yet"}
- Recent topics tracked: ${recentTopics.slice(0, 10).join(", ") || "None"}
- Recent study logs (summary): ${dailyLogs.slice(0, 5).map((l: any) => `${l.log_date}: ${l.hours_studied || 0}h`).join(", ") || "None"}
- Recent workouts (summary): ${workoutLogs.slice(0, 5).map((w: any) => `${w.log_date}: ${w.workout_type || "workout"}`).join(", ") || "None"}

Use this progress to tailor questions (e.g. ask more on topics they have studied/completed, and probe consistency/discipline based on logs). Start with an appropriate question if there is no conversation yet.`;

  const chat = Array.isArray(messages) ? messages.slice(-12) : [];
  const aiMessages = [
    { role: "system" as const, content: system },
    { role: "user" as const, content: contextText },
    ...chat.map((m: any) => ({ role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant", content: String(m.content || "") })),
    ...(chat.length === 0 ? [{ role: "user" as const, content: "Begin the interview with your first question tailored to my progress." }] : []),
  ];

  try {
    const text = await aiGenerateText({ task: "interview_followup", messages: aiMessages });
    return NextResponse.json({ ok: true, question: text, note: "Practice guidance only, never a selection prediction." });
  } catch (e: any) {
    const msg = String(e?.message || e);
    const hint = /gemini/i.test(msg) && /404|not found/i.test(msg)
      ? " (Gemini model/key issue — check GEMINI_API_KEY is a valid Google AI Studio key and server was restarted; Groq fallback may also need a valid GROQ_API_KEY.)"
      : "";
    return NextResponse.json({ ok: false, error: msg + hint }, { status: 500 });
  }
}
