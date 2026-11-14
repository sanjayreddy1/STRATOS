"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadStore } from "@/lib/local/store";
import { Map, Calendar, Flag } from "lucide-react";

export default function RoadmapPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { setItems(loadStore().roadmap_tasks || []); }, []);
  const phases = [1,2,3,4].map(p => ({ phase: p, items: items.filter(i => i.phase === p) }));
  const names: Record<number,string> = {1:"Months 1-4: Foundation",2:"Months 5-10: Skill Build",3:"Months 11-15: GTO & Interview",4:"Months 16-18: Revision & Polish"};
  const accents = ["from-primary/20 to-transparent","from-accent/10 to-transparent","from-primary/15 to-transparent","from-success/10 to-transparent"];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title flex items-center gap-2"><Map className="text-accent" size={24}/> 18-Month Roadmap</h1>
        <p className="page-subtitle mt-1">Your structured SSB preparation plan (stored locally). Reschedule when needed, but keep momentum.</p>
      </div>
      {phases.map((ph, idx) => (
        <Card key={ph.phase} className="overflow-hidden">
          <CardHeader className={`rounded-xl -m-1 mb-3 p-4 bg-gradient-to-r ${accents[idx]}`}>
            <div>
              <CardTitle className="flex items-center gap-2"><Flag size={16} className="text-accent"/> Phase {ph.phase}: {names[ph.phase]}</CardTitle>
              <div className="text-xs text-muted mt-1">{ph.items.length} milestones</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {ph.items.map(it => (
              <div key={it.id} className="border border-border/80 rounded-xl p-4 text-text bg-background/20 hover:border-border-hover transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="font-medium">{it.title}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${it.status === "done" ? "text-success border-success/30 bg-success/10" : "text-muted border-border"}`}>{it.status || "pending"}</span>
                </div>
                <div className="text-sm text-muted mt-1 leading-6">{it.description}</div>
                <div className="text-xs text-muted mt-2 inline-flex items-center gap-1.5"><Calendar size={13}/> Due: {it.due_date || "—"}</div>
              </div>
            ))}
            {!ph.items.length && <p className="text-muted text-sm rounded-xl border border-dashed border-border p-4">No roadmap items found. Complete onboarding to generate your plan.</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
