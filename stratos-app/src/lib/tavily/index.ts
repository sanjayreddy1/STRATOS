const TAVILY_URL = "https://api.tavily.com/search";

export type TavilyResult = {
  title: string;
  url: string;
  content?: string;
  score?: number;
  published_date?: string;
};

export async function tavilySearch(query: string, opts?: { maxResults?: number; topic?: "news" | "general"; days?: number }) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY missing");
  const res = await fetch(TAVILY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "basic",
      include_answer: false,
      include_images: false,
      include_raw_content: false,
      max_results: opts?.maxResults ?? 6,
      topic: opts?.topic ?? "news",
      days: opts?.days ?? 7,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tavily error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return (data.results || []) as TavilyResult[];
}

export const DEFAULT_NEWS_QUERIES = [
  "Indian Army news",
  "Indian defence current affairs",
  "India border security",
  "India defence deals and exercises",
  "Indian Army SSB interview tips",
  "IMA OTA training updates",
];
