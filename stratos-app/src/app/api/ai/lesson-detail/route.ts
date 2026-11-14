import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { tavilySearch } from "@/lib/tavily";
import { aiGenerateJson } from "@/lib/ai/router";

const LessonDetailSchema = z.object({
  overview: z.string(),
  detailed_material: z.array(z.string()).min(3),
  key_concepts: z.array(z.string()).min(3),
  ssb_application: z.array(z.string()).min(2),
  examples: z.array(z.string()).min(1),
  practice_questions: z.array(z.string()).min(3),
  daily_plan: z.array(z.string()).min(3),
  sources: z.array(z.object({ title: z.string(), url: z.string() })).default([]),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const topic = String(body.topic || "").trim();
  const focus = String(body.focus || "").trim();
  const ssbLink = String(body.ssbLink || "").trim();
  if (!topic) return NextResponse.json({ ok: false, error: "Topic is required" }, { status: 400 });

  if (!process.env.TAVILY_API_KEY) {
    return NextResponse.json({ ok: false, error: "TAVILY_API_KEY not configured on server" }, { status: 400 });
  }

  try {
    const queries = [
      `${topic} SSB interview preparation detailed guide`,
      `${topic} Indian Army SSB tips examples`,
      `${topic} ${focus} defence aspirant study material`,
    ];
    const results: any[] = [];
    for (const q of queries) {
      try {
        const r = await tavilySearch(q, { maxResults: 4, topic: "general", days: 365 });
        results.push(...r);
      } catch {}
    }
    const seen = new Set<string>();
    const deduped = results.filter(r => r?.url && !seen.has(r.url) && seen.add(r.url)).slice(0, 8);
    const sources = deduped.map(r => ({ title: r.title || r.url, url: r.url }));
    const webContext = deduped.map((r, i) => `Source ${i + 1}: ${r.title}\nURL: ${r.url}\nContent: ${(r.content || "").slice(0, 1200)}`).join("\n\n");

    const result = await aiGenerateJson({
      task: "study_plan",
      schema: LessonDetailSchema,
      messages: [
        {
          role: "system",
          content: `You are an expert SSB (Services Selection Board) coach for Indian Army TGC/SSC Tech aspirants.
Create detailed, practical learning material based on web sources provided. Be accurate, structured, and actionable.
Return STRICT JSON only with keys: overview, detailed_material (array of detailed paragraphs/sections), key_concepts (array), ssb_application (array: how to apply in SSB tests/interview/GTO/psych), examples (array), practice_questions (array), daily_plan (array of step-by-step study/practice tasks for today), sources (array of {title,url}).
Practice guidance only, never selection predictions. If sources are limited, still provide high-quality SSB-relevant material.`
        },
        {
          role: "user",
          content: `Today's lesson topic: ${topic}\nFocus: ${focus}\nSSB link: ${ssbLink}\n\nUse these web sources (Tavily):\n${webContext || "No web snippets available."}\n\nGenerate comprehensive, detailed learning material for today's lesson.`
        }
      ],
    });

    // ensure sources included
    if (!result.sources?.length) result.sources = sources.slice(0, 5);
    return NextResponse.json({ ok: true, detail: result, fetchedAt: new Date().toISOString() });
  } catch (e: any) {
    const msg = String(e?.message || e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
