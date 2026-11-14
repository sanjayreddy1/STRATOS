"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Target, Mic, FileText, Users, ShieldCheck, ArrowRight } from "lucide-react";

const modules = [
  { title: "OIR", desc: "Timed verbal/non-verbal reasoning, difficulty progression, analytics." },
  { title: "PPDT", desc: "Picture perception, story writing, and narration/group discussion concepts." },
  { title: "TAT", desc: "30s picture, 4-min story. Positivity, theme, hero action, OLQs, realistic ending." },
  { title: "WAT", desc: "60 words, 15s each. Positivity, action orientation, originality." },
  { title: "SRT", desc: "60 situations in 30 minutes. Practicality, promptness, responsibility, resourcefulness." },
  { title: "SD", desc: "Self-description with consistency across PIQ, interview, and psychology tests." },
  { title: "GTO Trainer", desc: "GD, GPE, PGT, HGT, IO, Command Task, Lecturette, FGT guidance." },
  { title: "Personal Interview", desc: "Profile-based questions, follow-ups, and feedback (practice guidance).", href: "/interviewer", cta: "Open AI Interviewer" },
  { title: "Mock SSB", desc: "5-day simulation flow and structured self-assessment/reporting." },
];

export default function SsbPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title flex items-center gap-2"><Brain className="text-accent" size={24}/> SSB Training Lab</h1>
        <p className="page-subtitle mt-1">Practice modules for psychology, GTO, and interview preparation — designed for consistent, honest self-improvement.</p>
      </div>

      <Card className="border-accent/20 bg-gradient-to-br from-primary/10 to-surface">
        <CardHeader><div><CardTitle className="flex items-center gap-2"><ShieldCheck size={18} className="text-accent"/> Practice guidance only</CardTitle><div className="text-xs text-muted mt-1">Not a selection prediction</div></div></CardHeader>
        <CardContent className="text-sm space-y-2 text-text/90">
          <p>AI evaluators target strict JSON: <code className="font-mono text-accent">{"{scores, olq_tags, strengths, improvements, model_answer}"}</code>. Feedback is constructive and penalizes negativity, bluffing, or vagueness.</p>
          <p className="text-muted">Local-storage mode stores your data in this browser. Server AI endpoints (e.g. <code className="font-mono">/api/ai/evaluate</code>, <code className="font-mono">/api/ai/interview</code>) require configured API keys and a restarted dev server.</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {modules.map(m => (
          <Card key={m.title} className="h-full">
            <CardHeader><CardTitle className="flex items-center gap-2"><Target size={16} className="text-accent"/> {m.title}</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted space-y-3 flex flex-col h-[calc(100%-2.5rem)]">
              <p className="leading-6">{m.desc}</p>
              {m.href ? (
                <Link href={m.href} className="inline-flex items-center gap-2 text-accent font-medium hover:underline mt-auto pt-1">
                  <Mic size={14}/> {m.cta || "Open"} <ArrowRight size={14}/>
                </Link>
              ) : (
                <div className="mt-auto pt-1 text-xs text-muted inline-flex items-center gap-1.5"><FileText size={13}/> Guided practice module</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users size={18} className="text-accent"/> Recommended daily flow</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          {[
            ["Learn", "Study today's lesson and detailed material"],
            ["Practice", "Attempt OIR/psych/GTO or interview drills"],
            ["Reflect", "Log outcomes, mistakes, and improvements"],
            ["Review", "Track progress in Analytics and Calendar"],
          ].map(([t,d]) => (
            <div key={t} className="rounded-xl border border-border bg-background/20 p-3">
              <div className="font-medium text-text">{t}</div>
              <div className="text-muted mt-1 leading-6">{d}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
