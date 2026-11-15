import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { aiGenerateJson } from "@/lib/ai/router";

const EvalSchema = z.object({
  score: z.number().min(0).max(100),
  verdict: z.string(),
  relevance: z.string(),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  improvements: z.array(z.string()).default([]),
  scolding: z.string().default(""),
  question_feedback: z.array(z.object({
    question: z.string(),
    answer_quality: z.string(),
    remarks: z.string(),
  })).default([]),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const lesson = body?.lesson || {};
  const messages = Array.isArray(body?.messages) ? body.messages : [];

  const transcript = messages.map((m: any) => `${m.role === "assistant" ? "IO" : "Candidate"}: ${String(m.content || "")}`).join("\n");
  const userAnswers = messages.filter((m: any) => m.role === "user").map((m: any) => String(m.content || "").trim()).filter(Boolean);

  if (userAnswers.length === 0) {
    return NextResponse.json({ ok: false, error: "No candidate answers found. Answer the interview questions before submitting for evaluation." }, { status: 400 });
  }

  try {
    const result = await aiGenerateJson({
      task: "interview_followup",
      schema: EvalSchema,
      messages: [
        {
          role: "system",
          content: `You are a very strict Senior SSB Interviewing Officer and evaluator for Indian Army (TGC/SSC Tech) preparation.
Evaluate the candidate's interview performance for the given lesson/topic based ONLY on the transcript.

Scoring (out of 100, be strict and realistic):
- Relevance to questions and lesson/topic (high weight)
- Clarity, structure, honesty, and depth
- Officer-like qualities demonstrated (responsibility, reasoning, confidence, initiative, self-awareness)
- Use of examples/facts where appropriate
- Communication and composure

Rules:
- If answers are irrelevant, off-topic, evasive, nonsensical, too short, or bluffing, give low marks and include a clear, firm scolding in "scolding" (professional but stern; explicitly call out irrelevance/lack of seriousness).
- If answers are mostly relevant and decent, "scolding" can be an empty string.
- Do NOT be lenient. Do NOT give selection predictions. This is practice guidance/evaluation.
- Return STRICT JSON with keys: score (number 0-100), verdict (short string), relevance (assessment), strengths (string[]), weaknesses (string[]), improvements (string[]), scolding (string), question_feedback (array of {question, answer_quality, remarks}).
- Keep text plain (no markdown asterisks/headings).`
        },
        {
          role: "user",
          content: `Lesson/Topic: ${lesson.topic || "SSB Interview"}
Focus: ${lesson.focus || ""}
SSB relevance: ${lesson.ssbLink || ""}
Learning objectives: ${(lesson.objectives || []).join("; ")}
Key points: ${(lesson.keyPoints || []).join("; ")}

Interview transcript:
${transcript}

Evaluate strictly out of 100 and provide detailed feedback. Scold clearly if any answer was not relevant.`
        }
      ]
    });
    const score = Math.max(0, Math.min(100, Math.round(Number(result.score) || 0)));
    return NextResponse.json({ ok: true, evaluation: { ...result, score, completedAt: new Date().toISOString(), answersCount: userAnswers.length } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
