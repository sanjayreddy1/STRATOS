"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadStore, saveStore, uid } from "@/lib/local/store";

export default function TrackerPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [name, setName] = useState(""); const [category, setCategory] = useState("Custom");
  const [title, setTitle] = useState(""); const [due, setDue] = useState(""); const [mins, setMins] = useState("");
  const refresh = () => { const s = loadStore(); setTopics(s.topics||[]); setTasks((s.tasks||[]).slice().sort((a,b)=>(a.due_date||"").localeCompare(b.due_date||""))); };
  useEffect(() => { setDue(new Date().toISOString().slice(0,10)); refresh(); }, []);
  const statuses = ["not_started","learning","revising","strong"];

  function addTopic(e: React.FormEvent) {
    e.preventDefault(); if (!name.trim()) return;
    const s = loadStore(); s.topics.push({ id: uid("topic"), name: name.trim(), category: category.trim()||"Custom", status: "not_started", confidence: 1 }); saveStore(s);
    setName(""); refresh();
  }
  function updateTopic(id: string, status: string, confidence: number) {
    const s = loadStore(); const t = s.topics.find(x=>x.id===id); if (t){ t.status=status; t.confidence=confidence; saveStore(s); refresh(); }
  }
  function addTask(e: React.FormEvent) {
    e.preventDefault(); if (!title.trim()) return;
    const s = loadStore(); s.tasks.push({ id: uid("task"), title: title.trim(), due_date: due, planned_minutes: mins?Number(mins):null, completed: false, source: "manual" }); saveStore(s);
    setTitle(""); setMins(""); refresh();
  }
  function toggleTask(id: string) {
    const s = loadStore(); const t = s.tasks.find(x=>x.id===id); if (t){ t.completed=!t.completed; t.completed_at=t.completed?new Date().toISOString():null; saveStore(s); refresh(); }
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-semibold">Preparation Tracker</h1>
      <Card>
        <CardHeader><CardTitle>Daily/weekly planner tasks</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={addTask} className="grid sm:grid-cols-[1fr_150px_120px_auto] gap-2 text-text">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Task (e.g. 60 WAT words practice)" className="h-11 rounded-xl border border-border bg-surface-raised px-3 text-sm" required />
            <input value={due} onChange={e=>setDue(e.target.value)} type="date" className="h-11 rounded-xl border border-border bg-surface-raised px-3 text-sm" />
            <input value={mins} onChange={e=>setMins(e.target.value)} type="number" placeholder="Min" className="h-11 rounded-xl border border-border bg-surface-raised px-3 text-sm" />
            <button className="h-11 px-4 rounded-xl bg-primary text-[#0B0D0C] font-medium">Add</button>
          </form>
          <div className="space-y-2">
            {tasks.map(t => (
              <div key={t.id} className="flex items-center justify-between gap-3 border border-border rounded-lg p-3 text-text">
                <div>
                  <div className={t.completed?"line-through text-muted":"font-medium"}>{t.title}</div>
                  <div className="text-xs text-muted">Due {t.due_date || "—"} {t.planned_minutes ? `• ${t.planned_minutes} min` : ""}</div>
                </div>
                <button onClick={()=>toggleTask(t.id)} className="h-9 px-3 rounded-lg border border-border hover:bg-surface-raised text-sm">{t.completed?"Undo":"Done"}</button>
              </div>
            ))}
            {!tasks.length && <p className="text-muted text-sm">No tasks yet. Add tasks to plan your day.</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Add topic</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={addTopic} className="grid sm:grid-cols-[1fr_1fr_auto] gap-2 text-text">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Topic name" className="h-11 rounded-xl border border-border bg-surface-raised px-3 text-sm" required />
            <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category" className="h-11 rounded-xl border border-border bg-surface-raised px-3 text-sm" />
            <button className="h-11 px-4 rounded-xl bg-primary text-[#0B0D0C] font-medium">Add</button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Topic checklist</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {topics.map(t => (
            <div key={t.id} className="grid md:grid-cols-[1fr_180px_140px_auto] gap-2 items-center border border-border rounded-lg p-3 text-text">
              <div><div className="font-medium">{t.name}</div><div className="text-xs text-muted">{t.category}</div></div>
              <select value={t.status} onChange={e=>updateTopic(t.id,e.target.value,t.confidence)} className="h-10 rounded-lg border border-border bg-surface-raised px-2 text-sm">
                {statuses.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </select>
              <select value={String(t.confidence)} onChange={e=>updateTopic(t.id,t.status,Number(e.target.value))} className="h-10 rounded-lg border border-border bg-surface-raised px-2 text-sm">
                {[1,2,3,4,5].map(n => <option key={n} value={n}>Confidence {n}/5</option>)}
              </select>
              <span className="text-xs text-muted">Saved locally</span>
            </div>
          ))}
          {!topics.length && <p className="text-muted">No topics yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
