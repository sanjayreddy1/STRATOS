import { NextRequest, NextResponse } from "next/server";
import { tavilySearch, DEFAULT_NEWS_QUERIES } from "@/lib/tavily";
import { aiGenerateJson } from "@/lib/ai/router";
import { z } from "zod";

const SummarySchema = z.object({
  summary: z.string(),
  interview_angles: z.array(z.string()).min(1).max(3),
});

async function summarize(title: string, content: string) {
  try {
    return await aiGenerateJson({
      task: "article_summary",
      schema: SummarySchema,
      messages: [
        { role: "system", content: "Summarize for SSB interview prep. Return strict JSON {\"summary\": string (max 2 sentences), \"interview_angles\": [2 likely interview questions]}. Be factual based on provided text." },
        { role: "user", content: `Title: ${title}\nContent: ${content || "(no content)"}` },
      ],
    });
  } catch {
    return { summary: (content || "").slice(0, 220), interview_angles: ["What is the significance of this development for India's defence preparedness?", "How could this topic be relevant in an SSB interview discussion?"] };
  }
}

export async function GET(_req: NextRequest) {
  if (!process.env.TAVILY_API_KEY) {
    return NextResponse.json({ items: [], warning: "TAVILY_API_KEY not configured on server. Add it to .env and restart the dev server." });
  }
  const items: any[] = [];
  const errors: string[] = [];
  for (const q of DEFAULT_NEWS_QUERIES.slice(0, 4)) {
    try {
      const results = await tavilySearch(q, { maxResults: 4, topic: "news", days: 7 });
      for (const r of results) {
        if (!r.url) continue;
        const ai = await summarize(r.title, r.content || "");
        items.push({
          id: r.url,
          url: r.url,
          title: r.title,
          source: (() => { try { return new URL(r.url).hostname; } catch { return null; } })(),
          published_at: r.published_date || null,
          summary: ai.summary,
          interview_angles: ai.interview_angles,
          topics: [q],
          fetched_at: new Date().toISOString(),
        });
      }
    } catch (e: any) {
      errors.push(String(e?.message || e));
    }
  }
  const seen = new Set<string>();
  const deduped = items.filter(i => (seen.has(i.url) ? false : (seen.add(i.url), true)));
  const warning = deduped.length === 0
    ? (errors[0] ? `Could not fetch news: ${errors[0]}` : "No news results returned. Check Tavily API key/quota and try again.")
    : (errors[0] ? `Fetched with some errors: ${errors[0]}` : undefined);
  return NextResponse.json({ items: deduped.slice(0, 20), cached: false, ...(warning ? { warning } : {}) });
}
