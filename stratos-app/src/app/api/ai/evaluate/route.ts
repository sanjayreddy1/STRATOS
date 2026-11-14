import { NextRequest, NextResponse } from "next/server";
import { aiGenerateJson } from "@/lib/ai/router";
import { z } from "zod";

const EvalSchema = z.object({
  scores: z.record(z.any()),
  olq_tags: z.array(z.string()).default([]),
  strengths: z.array(z.string()).default([]),
  improvements: z.array(z.string()).default([]),
  model_answer: z.string().default(""),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const testType = String(body.testType || "general").toLowerCase();
  const promptInput = body.input ?? body;
  const system = `You are an SSB practice evaluator for Indian Army TGC/SSC Tech preparation. Return STRICT JSON only: {"scores":{...},"olq_tags":[...],"strengths":[...],"improvements":[...],"model_answer":"..."}. Be honest and constructive, not flattering. Penalize negativity, bluffing, vagueness. Practice guidance only, never a selection prediction.`;
  try {
    const result = await aiGenerateJson({
      task: (["wat","srt","tat","sd","ppdt","feedback"].includes(testType) ? testType : "feedback") as any,
      schema: EvalSchema,
      messages: [{ role: "system", content: system }, { role: "user", content: `Evaluate this ${testType} response.\nINPUT:\n${JSON.stringify(promptInput, null, 2)}` }],
    });
    return NextResponse.json({ ok: true, result, note: "Practice guidance only. Store locally in browser if needed." });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
