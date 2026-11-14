"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const modules = [
  { title: "OIR", desc: "Timed verbal/non-verbal reasoning, difficulty progression, analytics." },
  { title: "PPDT", desc: "Image story + group discussion simulation concepts." },
  { title: "TAT", desc: "30s picture, 4-min story. Positivity, theme, hero action, OLQs, realistic ending." },
  { title: "WAT", desc: "60 words, 15s each. Positivity, action orientation, originality." },
  { title: "SRT", desc: "60 situations in 30 minutes. Practicality, promptness, responsibility, resourcefulness." },
  { title: "SD", desc: "Self-description with consistency check." },
  { title: "GTO Trainer", desc: "GD, GPE, PGT, HGT, IO, Command Task, Lecturette, FGT guidance." },
  { title: "Personal Interview", desc: "Profile-based questions, follow-ups, strengths/red flags/model answers (practice guidance).", href: "/interviewer" },
  { title: "Mock SSB", desc: "5-day simulation flow and report structure (practice guidance)." },
];

export default function SsbPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-semibold">SSB Training Lab</h1>
      <Card>
        <CardHeader><CardTitle>Practice guidance only</CardTitle></CardHeader>
        <CardContent className="text-sm">
          <p>AI evaluators target strict JSON: <code className="font-mono">{"{scores, olq_tags, strengths, improvements, model_answer}"}</code>. Honest/constructive; penalize negativity/bluffing/vagueness. <b>Scores are practice guidance only, never selection predictions.</b></p>
          <p className="text-muted mt-2">Local-storage mode: browser stores your data locally. Server AI evaluation endpoint (<code className="font-mono">/api/ai/evaluate</code>) requires AI keys and may need adaptation if it previously wrote to Supabase.</p>
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-4">
        {modules.map(m => (
          <Card key={m.title}>
            <CardHeader><CardTitle>{m.title}</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted space-y-2">
              <p>{m.desc}</p>
              {m.href && <Link href={m.href} className="inline-flex text-accent underline">Open AI Interviewer</Link>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
