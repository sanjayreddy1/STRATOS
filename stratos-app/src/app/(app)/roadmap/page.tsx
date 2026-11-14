"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadStore } from "@/lib/local/store";

export default function RoadmapPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { setItems(loadStore().roadmap_tasks || []); }, []);
  const phases = [1,2,3,4].map(p => ({ phase: p, items: items.filter(i => i.phase === p) }));
  const names: Record<number,string> = {1:"Months 1-4 Foundation",2:"Months 5-10 Skill Build",3:"Months 11-15 GTO & Interview",4:"Months 16-18 Revision & Polish"};
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-semibold">18-Month Roadmap</h1>
      <p className="text-muted text-sm">Stored locally in this browser. When days are missed, reschedule tasks instead of dropping them.</p>
      {phases.map(ph => (
        <Card key={ph.phase}>
          <CardHeader><CardTitle>Phase {ph.phase}: {names[ph.phase]}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {ph.items.map(it => (
              <div key={it.id} className="border border-border rounded-lg p-3 text-text">
                <div className="font-medium">{it.title}</div>
                <div className="text-sm text-muted">{it.description}</div>
                <div className="text-xs text-muted mt-1">Due: {it.due_date} • Status: {it.status}</div>
              </div>
            ))}
            {!ph.items.length && <p>No roadmap items found. Complete onboarding to generate your plan.</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
