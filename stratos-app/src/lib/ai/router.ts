import { z } from "zod";
import { AI_CONFIG, preferredProviderFor, type AiProvider, type AiTask } from "./config";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export class AiError extends Error {
  provider?: string;
  constructor(message: string, provider?: string) {
    super(message);
    this.name = "AiError";
    this.provider = provider;
  }
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try { return JSON.parse(trimmed); } catch {}
  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i) || trimmed.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (match) return JSON.parse(match[1] ?? match[0]);
  throw new AiError("Model did not return valid JSON");
}

async function callGroq(messages: ChatMessage[], expectJson: boolean): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new AiError("GROQ_API_KEY missing", "groq");
  const res = await fetchWithTimeout(
    AI_CONFIG.groq.baseUrl,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: AI_CONFIG.groq.fastModel,
        messages,
        temperature: 0.4,
        ...(expectJson ? { response_format: { type: "json_object" } } : {}),
      }),
    },
    AI_CONFIG.groq.timeoutMs,
  );
  if (!res.ok) throw new AiError(`Groq error ${res.status}: ${await res.text()}`, "groq");
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callGemini(messages: ChatMessage[], expectJson: boolean, task: AiTask): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AiError("GEMINI_API_KEY missing", "gemini");
  const model = task === "long_context" || task === "weekly_report" || task === "study_plan" ? AI_CONFIG.gemini.longContextModel : AI_CONFIG.gemini.model;
  const system = messages.filter(m => m.role === "system").map(m => m.content).join("\n");
  const contents = messages.filter(m => m.role !== "system").map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const res = await fetchWithTimeout(
    `${AI_CONFIG.gemini.baseUrl}/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        contents,
        generationConfig: { temperature: 0.4, ...(expectJson ? { responseMimeType: "application/json" } : {}) },
      }),
    },
    AI_CONFIG.gemini.timeoutMs,
  );
  if (!res.ok) throw new AiError(`Gemini error ${res.status}: ${await res.text()}`, "gemini");
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
}

async function callProvider(provider: AiProvider, messages: ChatMessage[], expectJson: boolean, task: AiTask) {
  return provider === "groq" ? callGroq(messages, expectJson) : callGemini(messages, expectJson, task);
}

export async function aiGenerateText(opts: { task: AiTask; messages: ChatMessage[]; provider?: AiProvider }): Promise<string> {
  const order: AiProvider[] = [];
  const preferred = opts.provider ?? preferredProviderFor(opts.task);
  order.push(preferred, preferred === "groq" ? "gemini" : "groq");
  let lastErr: unknown;
  for (const p of order) {
    for (let i = 0; i < AI_CONFIG.retry.attempts; i++) {
      try {
        return await callProvider(p, opts.messages, false, opts.task);
      } catch (e) {
        lastErr = e;
        await new Promise(r => setTimeout(r, AI_CONFIG.retry.backoffMs * (i + 1)));
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new AiError("AI generation failed");
}

export async function aiGenerateJson<T>(opts: { task: AiTask; messages: ChatMessage[]; schema: z.ZodSchema<T>; provider?: AiProvider }): Promise<T> {
  const order: AiProvider[] = [];
  const preferred = opts.provider ?? preferredProviderFor(opts.task);
  order.push(preferred, preferred === "groq" ? "gemini" : "groq");
  let lastErr: unknown;
  for (const p of order) {
    for (let i = 0; i < AI_CONFIG.retry.attempts; i++) {
      try {
        const text = await callProvider(p, opts.messages, true, opts.task);
        const json = extractJson(text);
        return opts.schema.parse(json);
      } catch (e) {
        lastErr = e;
        await new Promise(r => setTimeout(r, AI_CONFIG.retry.backoffMs * (i + 1)));
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new AiError("AI JSON generation failed");
}
